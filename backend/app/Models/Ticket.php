<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'requester_id',
        'assignee_id',
        'subject',
        'description',
        'status',
        'priority',
        'tags',
        'sla_breach_at'
    ];

    protected $casts = [
        'tags' => 'array',
        'sla_breach_at' => 'datetime'
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    
    public function activities()
    {
        return $this->hasMany(ActivityLog::class);
    }
}
