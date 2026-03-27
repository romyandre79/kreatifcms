<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * Check if the user has a specific permission.
     *
     * @param string $contentType
     * @param string $action
     * @return bool
     */
    public function hasPermission($contentType, $action = 'read')
    {
        if (!$this->role) {
            return false;
        }

        // Super Admin has all permissions
        if ($this->role->slug === 'super-admin') {
            return true;
        }

        return $this->role->permissions()
            ->where('content_type', $contentType)
            ->where('action', $action)
            ->where('enabled', true)
            ->exists();
    }

    /**
     * Get all enabled permissions for the user.
     *
     * @return \Illuminate\Support\Collection
     */
    public function allPermissions()
    {
        if (!$this->role) {
            return collect([]);
        }

        if ($this->role->slug === 'super-admin') {
            // Return a special flag or all permissions if needed, 
            // but for frontend filtering, 'all' is usually enough.
            return collect([['content_type' => '*', 'action' => '*']]);
        }

        return $this->role->permissions()
            ->where('enabled', true)
            ->get(['content_type', 'action']);
    }
}
