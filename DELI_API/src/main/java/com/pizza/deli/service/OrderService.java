package com.pizza.deli.service;

import com.pizza.deli.dto.OrderDTO;
import com.pizza.deli.model.Order;
import com.pizza.deli.model.OrderDetail;
import com.pizza.deli.model.User;
import com.pizza.deli.model.OrderStatusEnum;
import com.pizza.deli.repository.OrderDetailRepository;
import com.pizza.deli.repository.OrderRepository;
import com.pizza.deli.repository.UserRepository;




import com.pizza.deli.model.Product;
import com.pizza.deli.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<OrderDTO> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByOrderIdAsc();
        List<OrderDTO> orderDTOs = new ArrayList<>();
        for (Order order : orders) {
            OrderDTO orderDTO = convertToDTO(order);
            try {
                orderDTO.setUserId(order.getUser().getId());
                System.out.println("Order ID: " + order.getOrderId() + ", Status: " + order.getStatus());
                orderDTOs.add(orderDTO);
            } catch (Exception e) {
                System.out.println("Error mapping order: " + e.getMessage());
                orderDTOs.add(orderDTO);
            }
        }
        return orderDTOs;
    }

    public List<OrderDTO> getOrderByUserID(Long userID) {
        Optional<User> userExits = userRepository.findById(userID);

            User user = userExits.get();
        Optional<List<Order>> orderOptional = Optional.ofNullable(orderRepository.findByUser(user));
        List<Order> orders = orderOptional.get();
        List<OrderDTO> OrderDTOs = new ArrayList<>();
        for (Order order : orders) {
            OrderDTO OrderDTO = convertToDTO(order);
            try {
                OrderDTO.setUserId(order.getUser().getId());
                OrderDTOs.add(OrderDTO);
            } catch (Exception e) {
                OrderDTOs.add(OrderDTO);
            }
        }
        return OrderDTOs;
    }


    public Boolean checkUserOrderProduct(Long userID, String productId) {
        if (userID == null || productId == null) return false;
        Optional<User> userExits = userRepository.findById(userID);
        if (!userExits.isPresent()) return false;
        User user = userExits.get();
        List<Order> orders = orderRepository.findByUser(user);
        if (orders == null) return false;
        for (Order order : orders) {
            if (order.getStatus() == OrderStatusEnum.COMPLETED) {
                Optional<List<OrderDetail>> orderDetailOptional = orderDetailRepository.findByOrder(order);
                if (orderDetailOptional.isPresent()) {
                    for (OrderDetail orderDetail : orderDetailOptional.get()) {
                        if (orderDetail.getProduct() != null && orderDetail.getProduct().getProductId() != null) {
                            if (String.valueOf(orderDetail.getProduct().getProductId()).equals(productId.trim())) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }




    public OrderDTO getOrderById(Long orderId) {
        Optional<Order> orderOptional = orderRepository.findByOrderId(orderId);
        if(orderOptional.isPresent()) {
            Order order = orderOptional.get();
            OrderDTO orderDTO = convertToDTO(order);
            try {
                orderDTO.setUserId(order.getUser().getId());
            } catch (Exception e) {
            }
            return orderDTO;
        } else { return null;}

    }

    @Transactional
    public Boolean updateStatus(Long orderID, OrderStatusEnum status) {
        Optional<Order> orderOptional = orderRepository.findByOrderId(orderID);
        if(orderOptional.isPresent()) {
            Order order = orderOptional.get();
            OrderStatusEnum oldStatus = order.getStatus();

            // Đơn hàng đã hoàn thành hoặc đã hủy thì không cho phép đổi trạng thái nữa
            if (oldStatus == OrderStatusEnum.COMPLETED || oldStatus == OrderStatusEnum.CANCELLED) {
                throw new IllegalStateException("Đơn hàng đã " + (oldStatus == OrderStatusEnum.COMPLETED ? "hoàn thành" : "bị hủy") + ", không thể thay đổi trạng thái nữa!");
            }

            order.setStatus(status);
            orderRepository.save(order);

            // Hoàn lại số lượng tồn kho nếu đơn hàng bị hủy
            if (status == OrderStatusEnum.CANCELLED && oldStatus != OrderStatusEnum.CANCELLED) {
                Optional<List<OrderDetail>> orderDetailOptional = orderDetailRepository.findByOrder(order);
                if (orderDetailOptional.isPresent()) {
                    for (OrderDetail detail : orderDetailOptional.get()) {
                        Product product = detail.getProduct();
                        if (product != null) {
                            int qty = detail.getQuantity() != null ? detail.getQuantity() : 1;
                            int curr = product.getStock() != null ? product.getStock() : 0;
                            product.setStock(curr + qty);
                            productRepository.save(product);
                        }
                    }
                }
            } else if (oldStatus == OrderStatusEnum.CANCELLED && status != OrderStatusEnum.CANCELLED) {
                // Nếu khôi phục từ trạng thái hủy sang trạng thái khác, trừ lại tồn kho
                Optional<List<OrderDetail>> orderDetailOptional = orderDetailRepository.findByOrder(order);
                if (orderDetailOptional.isPresent()) {
                    for (OrderDetail detail : orderDetailOptional.get()) {
                        Product product = detail.getProduct();
                        if (product != null) {
                            int qty = detail.getQuantity() != null ? detail.getQuantity() : 1;
                            int curr = product.getStock() != null ? product.getStock() : 0;
                            product.setStock(Math.max(0, curr - qty));
                            productRepository.save(product);
                        }
                    }
                }
            }

            return true;
        }
        return false;
    }


//    public OrderDTO createOrder(OrderDTO orderDTO) {
//        try {
//            Optional<User> userExits = userRepository.findById(orderDTO.getUserId());
//            if(userExits.isPresent()) {
//                User user = userExits.get();
//                Order order = modelMapper.map(orderDTO, Order.class);
//                if(orderDTO.getStatus() == null) {
//                    order.setStatus(OrderStatusEnum.PROCESSING);
//                }
//                order.setUser(user);
//                Order saved = orderRepository.save(order);
//                return convertToDTO(saved);
//            } else {
//                return null;
//            }
//
//        } catch (Exception e) {
//            e.getMessage();
//        }
//        return null;
//
//    }
    public OrderDTO createOrder(OrderDTO orderDTO) {
        try {
            Optional<User> userExits = userRepository.findById(orderDTO.getUserId());
            if (userExits.isPresent()) {
                User user = userExits.get();
                Order order = modelMapper.map(orderDTO, Order.class);
                // Bắt buộc gán status nếu null hoặc không hợp lệ
                if (order.getStatus() == null) {
                    order.setStatus(OrderStatusEnum.PROCESSING);
                }
                order.setUser(user);
                Order saved = orderRepository.save(order);
                OrderDTO result = convertToDTO(saved);
                System.out.println("Saved Order Status: " + saved.getStatus()); // Debug
                return result;
            } else {
                return null;
            }
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            return null;
        }
    }

    public OrderDTO updateOrder(Long orderId, OrderDTO orderDTO) {
        Optional<Order> existingOrderOptional = orderRepository.findByOrderId(orderId);
        if (existingOrderOptional.isPresent()) {
            // Update existing  directly
            Order existingOrder = existingOrderOptional.get();

            if (orderDTO.getOrderId() != null) {
                existingOrder.setOrderId(orderDTO.getOrderId());
            }
            if (orderDTO.getAddress() != null) {
                existingOrder.setAddress(orderDTO.getAddress());
            }
            
            if (orderDTO.getUsername() != null) {
                existingOrder.setUsername(orderDTO.getUsername());
            }
           
            if (orderDTO.getQuantity() != null) {
                existingOrder.setQuantity(orderDTO.getQuantity());
            }
           
            if (orderDTO.getImage() != null) {
                existingOrder.setImage(orderDTO.getImage());
            }
            if (orderDTO.getTotalPrice() != null) {
                existingOrder.setTotalPrice(orderDTO.getTotalPrice());
            }

            if (orderDTO.getUserId() != null) {
                Optional<User> userExits = userRepository.findById(orderDTO.getUserId());
                if(userExits.isPresent()) {
                    User userEntity = userExits.get();
                    existingOrder.setUser(userEntity);
                } else {
                    return null;
                }

            }

            Order saved = orderRepository.save(existingOrder);  // Save the updated 

            return convertToDTO(saved);
        } else {
            return null;
        }
    }



    private OrderDTO convertToDTO(Order order) {
        return modelMapper.map(order, OrderDTO.class);
    }
}