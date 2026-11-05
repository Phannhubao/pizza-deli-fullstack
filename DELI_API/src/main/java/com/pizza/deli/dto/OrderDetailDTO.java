package com.pizza.deli.dto;

import lombok.Data;

@Data
public class OrderDetailDTO {

    private Long detailId;

  
    private Integer quantity;

 
    private Double price;

    
    private String produc_name;

    private String image;

    private String options;

    private String note;

    private Long orderId;

   
    private Integer productId;

    private Boolean CanFeedBack ;

}
