package com.pizza.deli.model;


import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "orderDetail")
public class OrderDetail {

    @Id
    @Column(name = "detail_id", unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long detailId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "price", nullable = false)
    private Double price;

    @Column(name = "produc_name", nullable = false)
    private String produc_name;

    @Column(name = "image", nullable = true)
    private String image;

    @Column(name = "options", length = 500, nullable = true)
    private String options;

    @Column(name = "note", length = 255, nullable = true)
    private String note;

    @Column(name="CanFeedBack ")
    private Boolean CanFeedBack ;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "order_id", referencedColumnName = "order_id")
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "product_id")
    private Product product;


}
