<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $contentType
     * @param  string  $action
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string $contentType, string $action = 'read'): Response
    {
        $user = $request->user();

        if (!$user || !$user->hasPermission($contentType, $action)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'Unauthorized. You do not have permission to ' . $action . ' ' . $contentType . '.'
                ], 403);
            }

            abort(403, 'Unauthorized. You do not have permission to ' . $action . ' ' . $contentType . '.');
        }

        return $next($request);
    }
}
