<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReconcileStuckOrders extends Command
{
    protected $signature   = 'orders:reconcile';
    protected $description = 'Cancel orders stuck in pending with no payment after 15 minutes';

    public function handle(): int
    {
        $stuckOrders = Order::where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->whereIn('payment_method', ['cliq']) // COD stays pending intentionally
            ->where('created_at', '<', now()->subMinutes(15))
            ->where('cliq_expires_at', '<', now())
            ->with(['items.variant'])
            ->get();

        if ($stuckOrders->isEmpty()) {
            $this->info('No stuck orders found.');
            return Command::SUCCESS;
        }

        $cancelled = 0;

        foreach ($stuckOrders as $order) {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $item->variant?->increment('stock', $item->quantity);
                }

                $order->update([
                    'status' => 'cancelled',
                    'notes'  => trim(($order->notes ?? '') . "\nAuto-cancelled: payment timeout"),
                ]);

                OrderStatusHistory::create([
                    'order_id'    => $order->id,
                    'changed_by'  => null,
                    'from_status' => 'pending',
                    'to_status'   => 'cancelled',
                    'notes'       => 'Auto-cancelled by system: payment expired',
                ]);
            });

            $this->info("Auto-cancelled order {$order->order_number}");
            Log::info('Auto-cancelled stuck order', [
                'order_number' => $order->order_number,
                'order_id'     => $order->id,
                'created_at'   => $order->created_at,
            ]);

            $cancelled++;
        }

        $this->info("Reconciliation complete: {$cancelled} order(s) cancelled.");

        return Command::SUCCESS;
    }
}
