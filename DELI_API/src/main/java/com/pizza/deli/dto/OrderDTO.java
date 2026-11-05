package com.pizza.deli.dto;

import com.pizza.deli.model.Order;
import com.pizza.deli.model.OrderStatusEnum;
import lombok.Data;

@Data
public class OrderDTO extends BaseDTO{
    private Long orderId;
    private String phone_number;
    private String address;
    private OrderStatusEnum status;
    private String username;
    private Integer quantity;
    private Double totalPrice;
    private String voucherCode;
    private Double discountAmount;
    private String image;
    private Long userId;

    // Phương thức chuyển đổi từ Entity sang DTO
    public static OrderDTO fromEntity(Order order) {
        if (order == null) return null;

        OrderDTO dto = new OrderDTO();
        dto.setOrderId(order.getOrderId());
        dto.setPhone_number(order.getPhone_number()); // đổi tên nếu entity khác
        dto.setAddress(order.getAddress());
        dto.setStatus(order.getStatus());
        dto.setUsername(order.getUsername());       // đổi nếu entity dùng quan hệ User
        dto.setQuantity(order.getQuantity());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setVoucherCode(order.getVoucherCode());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setImage(order.getImage());
//        dto.setUserId(order.getUser_Id());           // hoặc order.getUser().getUserId() nếu dùng quan hệ
        return dto;
    }
}
