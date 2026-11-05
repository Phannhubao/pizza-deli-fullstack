package com.pizza.deli.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.config.GetDataErrorUtils;
import com.pizza.deli.dto.OrderDetailDTO;
import com.pizza.deli.service.OrderDetailService;

import java.util.List;

@RestController
@RequestMapping("/api/OrderDeTail")
public class OrderDetailController {

    @Autowired
    private OrderDetailService orderDetailService;

    @Autowired
    private CustomStatusResponse customStatusResponse;

    @Autowired
    private GetDataErrorUtils getDataErrorUtils;

    @GetMapping("/GetOrderDetailList")
    public ResponseEntity<List<OrderDetailDTO>> getAllOrderDetails() {
        try {
            List<OrderDetailDTO> OrderDetails = orderDetailService.getAllOrderDetails();
            if (OrderDetails.isEmpty()) {
                return customStatusResponse.NOTFOUND404("No Order Detail found");
            }
            return customStatusResponse.OK200("Get List of OrderDetail Successfully", OrderDetails);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping("/GetDetailListByOrder/{orderID}")
    public ResponseEntity<List<OrderDetailDTO>> getAllDetailByOrderID(@PathVariable Long orderID) {
        try {
            List<OrderDetailDTO> OrderDetails = orderDetailService.getOrderDetailByOrderID(orderID);
            if (OrderDetails.isEmpty()) {
                return customStatusResponse.NOTFOUND404("No Order Detail found");
            }
            return customStatusResponse.OK200("Get List of Order Detail Successfully", OrderDetails);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @CrossOrigin
    @PostMapping("/AddOrderDetail")
    public ResponseEntity<OrderDetailDTO> createOrderDetail(@RequestBody OrderDetailDTO OrderDetailDTO, BindingResult rs) {
        try {
            if(rs.hasErrors()){
                var errors = getDataErrorUtils.DataError(rs);
                return customStatusResponse.BADREQUEST400("Provider data is incorrect", errors);
            }

            OrderDetailDTO createdOrderDetail = orderDetailService.createOrderDetail(OrderDetailDTO);
            if(createdOrderDetail == null ){
                return customStatusResponse.BADREQUEST400("Have error when create Order Detail !");
            }
            return customStatusResponse.CREATED201("Order Detail created", createdOrderDetail);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    // Endpoint mới để tạo nhiều OrderDetail cùng lúc
    @CrossOrigin
    @PostMapping("/AddOrderDetailList")
    public ResponseEntity<List<OrderDetailDTO>> createOrderDetailList(@RequestBody List<OrderDetailDTO> orderDetailDTOList) {
        try {

            if (orderDetailDTOList == null || orderDetailDTOList.isEmpty()) {
                return customStatusResponse.BADREQUEST400("Order detail list cannot be empty");
            }

            List<OrderDetailDTO> createdOrderDetails = orderDetailService.createOrderDetailList(orderDetailDTOList);
            if(createdOrderDetails == null || createdOrderDetails.isEmpty()){
                return customStatusResponse.BADREQUEST400("Have error when create Order Details!");
            }
            return customStatusResponse.CREATED201("Order Details created successfully", createdOrderDetails);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }
}