<?php

namespace Modules\SocialMediaBlock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SocialMediaBlockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('socialmediablock::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('socialmediablock::create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request) {}

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('socialmediablock::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('socialmediablock::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
