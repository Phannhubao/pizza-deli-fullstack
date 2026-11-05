package com.pizza.deli.model;

public enum UserStatus {
    ACTIVE("Hoạt động"),
    BANNED("Bị cấm");

    private final String description;

    UserStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
