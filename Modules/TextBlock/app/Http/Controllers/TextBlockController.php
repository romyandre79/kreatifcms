<?php

namespace Modules\TextBlock\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class TextBlockController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('textblock::index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('textblock::create');
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
        return view('textblock::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('textblock::edit');
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
