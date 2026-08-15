package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class QuantityAdjustRequest {

    public enum Mode {
        /** value is added to (or subtracted from, if negative) the current quantity */
        DELTA,
        /** current quantity is replaced by value */
        SET
    }

    @NotNull(message = "Mode is required (DELTA or SET)")
    private Mode mode;

    @NotNull(message = "Value is required")
    private Integer value;

    /** Optimistic-lock token from the last read, used to detect concurrent edits. Optional. */
    private Long expectedVersion;
}
