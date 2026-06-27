<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'ticket_id',
        'user_id',
        'action',
        'description'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
