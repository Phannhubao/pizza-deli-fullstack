package com.pizza.deli.dto;

import java.sql.Timestamp;



import lombok.Data;

@Data
public class BaseDTO {
    private Timestamp createdAt;
    private Timestamp modifiedAt;
    private Timestamp deletedAt;
}
