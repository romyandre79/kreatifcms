<?php

namespace Modules\OtpService\Interfaces;

interface OtpServiceInterface
{
    /**
     * Send OTP message.
     *
     * @param string $to
     * @param string $message
     * @return bool
     */
    public function send(string $to, string $message): bool;
}
