package com.pizza.deli.model;

public enum Role {
	ADMIN("Quản trị viên"),
    CUSTOMER("Khách hàng");

    private final String description;

    Role(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
