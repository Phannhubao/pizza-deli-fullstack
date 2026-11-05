package com.pizza.deli.service;

import com.pizza.deli.dto.OrderDetailDTO;
import com.pizza.deli.model.Order;
import com.pizza.deli.model.OrderDetail;
import com.pizza.deli.model.Product;
import com.pizza.deli.repository.OrderDetailRepository;
import com.pizza.deli.repository.OrderRepository;
import com.pizza.deli.repository.ProductRepository;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderDetailService {

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ModelMapper modelMapper;

    public List<OrderDetailDTO> getAllOrderDetails() {
        List<OrderDetail> orderDetails = orderDetailRepository.findAllByOrderByDetailIdDesc();
        List<OrderDetailDTO> orderDetailDTOs = new ArrayList<>();
        for (OrderDetail orderDetail : orderDetails) {
            OrderDetailDTO orderDetailDTO = convertToDTO(orderDetail);
            try {
                orderDetailDTO.setOrderId(orderDetail.getOrder().getOrderId());
                orderDetailDTO.setProductId(orderDetail.getProduct().getProductId());
                orderDetailDTOs.add(orderDetailDTO);
            } catch (Exception e) {
                orderDetailDTOs.add(orderDetailDTO);
            }
        }
        return orderDetailDTOs;
    }

    public List<OrderDetailDTO> getOrderDetailByOrderID(Long orderID) {
        Optional<Order> orderExits = orderRepository.findByOrderId(orderID);
        Order order = orderExits.get();

        Optional<List<OrderDetail>> orderDetailOptional = orderDetailRepository.findByOrder(order);
        List<OrderDetail> orderDetails = orderDetailOptional.get();
        List<OrderDetailDTO> orderDetailDTOs = new ArrayList<>();
        for (OrderDetail orderDetail : orderDetails) {
            OrderDetailDTO orderDetailDTO = convertToDTO(orderDetail);
            try {
                orderDetailDTO.setOrderId(orderDetail.getOrder().getOrderId());
                orderDetailDTO.setProductId(orderDetail.getProduct().getProductId());
                orderDetailDTOs.add(orderDetailDTO);
            } catch (Exception e) {
                orderDetailDTOs.add(orderDetailDTO);
            }
        }
        return orderDetailDTOs;
    }

    @Transactional
    public OrderDetailDTO createOrderDetail(OrderDetailDTO orderDetailDTO) {
        try {
            Optional<Order> orderExits = orderRepository.findByOrderId(orderDetailDTO.getOrderId());
            Optional<Product> productExits = productRepository.findById(orderDetailDTO.getProductId());

            if(orderExits.isPresent() && productExits.isPresent()) {
                Order order = orderExits.get();
                Product product = productExits.get();

                // Trừ số lượng tồn kho của sản phẩm
                int quantity = (orderDetailDTO.getQuantity() != null && orderDetailDTO.getQuantity() > 0)
                        ? orderDetailDTO.getQuantity() : 1;
                int currentStock = product.getStock() != null ? product.getStock() : 0;
                int newStock = Math.max(0, currentStock - quantity);
                product.setStock(newStock);
                productRepository.save(product);

                OrderDetail orderDetail = modelMapper.map(orderDetailDTO, OrderDetail.class);
                orderDetail.setOrder(order);
                orderDetail.setProduct(product);
                OrderDetail saved = orderDetailRepository.save(orderDetail);
                return convertToDTO(saved);
            } else {
                return null;
            }

        } catch (Exception e) {
            e.getMessage();
        }
        return null;
    }

    // Method mới để tạo danh sách OrderDetail và trừ tồn kho
    @Transactional
    public List<OrderDetailDTO> createOrderDetailList(List<OrderDetailDTO> orderDetailDTOList) {
        List<OrderDetailDTO> createdOrderDetails = new ArrayList<>();
        
        try {
            for (OrderDetailDTO orderDetailDTO : orderDetailDTOList) {
                // Kiểm tra Order và Product có tồn tại không
                Optional<Order> orderExists = orderRepository.findByOrderId(orderDetailDTO.getOrderId());
                Optional<Product> productExists = productRepository.findById(orderDetailDTO.getProductId());

                if (orderExists.isPresent() && productExists.isPresent()) {
                    Order order = orderExists.get();
                    Product product = productExists.get();

                    // Trừ số lượng tồn kho của sản phẩm
                    int quantity = (orderDetailDTO.getQuantity() != null && orderDetailDTO.getQuantity() > 0)
                            ? orderDetailDTO.getQuantity() : 1;
                    int currentStock = product.getStock() != null ? product.getStock() : 0;
                    int newStock = Math.max(0, currentStock - quantity);
                    product.setStock(newStock);
                    productRepository.save(product);
                    
                    // Tạo OrderDetail entity
                    OrderDetail orderDetail = modelMapper.map(orderDetailDTO, OrderDetail.class);
                    orderDetail.setOrder(order);
                    orderDetail.setProduct(product);
                    
                    // Lưu vào database
                    OrderDetail saved = orderDetailRepository.save(orderDetail);
                    OrderDetailDTO savedDTO = convertToDTO(saved);
                    
                    // Set lại orderId và productId cho DTO
                    savedDTO.setOrderId(order.getOrderId());
                    savedDTO.setProductId(product.getProductId());
                    
                    createdOrderDetails.add(savedDTO);
                } else {
                    throw new RuntimeException("Order ID " + orderDetailDTO.getOrderId() + 
                                             " or Product ID " + orderDetailDTO.getProductId() + " not found");
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating order details: " + e.getMessage());
        }
        
        return createdOrderDetails;
    }

    private OrderDetailDTO convertToDTO(OrderDetail orderDetailEntity) {
        return modelMapper.map(orderDetailEntity, OrderDetailDTO.class);
    }
}