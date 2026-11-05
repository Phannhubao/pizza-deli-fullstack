package com.pizza.deli.dto;


import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

import lombok.Data;

@Data
public class PaymentDTO  {
    private Boolean status;

    private String fullname;

    private Long orderId;

}
