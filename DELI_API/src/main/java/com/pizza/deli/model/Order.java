package com.pizza.deli.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "orderTb")
public class Order extends BaseEntity {
    @Id
    @Column(name = "order_id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Column(name = "phone_number", nullable = false)
    private String phone_number;

    @Column(name = "address", nullable = false)
    private String address;

    @Column(name="status")
    @Enumerated(EnumType.STRING) // Quan trọng: chỉ định lưu dưới dạng string trong DB
    private OrderStatusEnum status;

    @Column(name="quantity")
    private Integer quantity;

    @Column(name="total_price")
    private Double totalPrice;

    @Column(name = "voucher_code", nullable = true)
    private String voucherCode;

    @Column(name = "discount_amount", nullable = true)
    private Double discountAmount;

    private String image;

    @Column(name = "username", nullable = false)
    private String username;

    @OneToMany(mappedBy = "order",fetch = FetchType.LAZY ,orphanRemoval = true)
    @JsonManagedReference
    private Set<OrderDetail> orderDetail;

    @JsonBackReference("user-orders") // Đặt tên cụ thể
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    private User user;

    @JsonBackReference("order-payment") // Đặt tên riêng cho quan hệ với Payment
    @OneToOne(mappedBy = "orderPayment")
    private Payment payment;

}
