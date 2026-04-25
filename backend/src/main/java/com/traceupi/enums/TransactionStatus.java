package com.traceupi.enums;

public enum TransactionStatus {
    FAILED(0),
    UNDER_REVIEW(1),
    ESCALATED(2),
    RESOLVED(3),
    CLOSED(4);

    private final int order;

    TransactionStatus(int order) {
        this.order = order;
    }

    public int getOrder() {
        return order;
    }

    /**
     * Check if a transition from this status to the target status is valid.
     * Only forward transitions are allowed (higher order value).
     */
    public boolean canTransitionTo(TransactionStatus target) {
        return target.order > this.order;
    }
}
