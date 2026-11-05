package com.pizza.deli.controller;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.config.GetDataErrorUtils;
import com.pizza.deli.config.VnPayConfig;
import com.pizza.deli.dto.OrderDTO;
import com.pizza.deli.model.OrderStatusEnum;
import com.pizza.deli.service.OrderService;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

@CrossOrigin
@RestController
@RequestMapping("/api/Order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomStatusResponse customStatusResponse;

    @Autowired
    private GetDataErrorUtils getDataErrorUtils;

    @GetMapping("/GetOrderList")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        try {
            List<OrderDTO> orders = orderService.getAllOrders();
            if (orders.isEmpty()) {
                return customStatusResponse.NOTFOUND404("No Order found");

            }
            return customStatusResponse.OK200("Get List of Order Successfully", orders);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping("/GetOrderListByUserId/{userId}")
    public ResponseEntity<List<OrderDTO>> getAllOrderListByUserIdtOrderListByUserId(@PathVariable Long userId) {
        try {
            List<OrderDTO> orders = orderService.getOrderByUserID(userId);
            if (orders.isEmpty()) {
                return customStatusResponse.NOTFOUND404("No Order found");
            }
            return customStatusResponse.OK200("Get List of Order Successfully", orders);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }


    @GetMapping("/GetOrder/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        try {
            OrderDTO orderDTO = orderService.getOrderById(orderId);
            if (orderDTO == null) {
                return customStatusResponse.NOTFOUND404("Order not found");
            }
            return customStatusResponse.OK200("Order found", orderDTO);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping("/checkOrderProduct/{userId}/{productId}")
    public ResponseEntity<Boolean> checkUserOrder(@PathVariable Long userId, @PathVariable String productId) {
        try {
            Boolean check = orderService.checkUserOrderProduct(userId,productId);
            return customStatusResponse.OK200("Check compelete!", check);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @PostMapping("/AddOrder")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody  OrderDTO orderDTO, BindingResult rs) {
        try {
            if(rs.hasErrors()){
                var errors = getDataErrorUtils.DataError(rs);
                return customStatusResponse.BADREQUEST400("Provider data is incorrect",errors);
            }
            Long userID = orderDTO.getUserId();

            OrderDTO createdOrder = orderService.createOrder(orderDTO);
            if(createdOrder == null ){
                return customStatusResponse.BADREQUEST400("Have error when create order !");
            }
            createdOrder.setUserId(userID);
            return customStatusResponse.CREATED201("Order created", createdOrder);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }

    }

    @PutMapping("/UpdateStatusOrder/{orderID}")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable("orderID") Long orderID,@RequestBody OrderStatusEnum status) {
        try {
            Boolean updatedProductStatus = orderService.updateStatus(orderID,status);
            if (updatedProductStatus == false) {
                return customStatusResponse.NOTFOUND404("Order not found");
            }
            return customStatusResponse.OK200("Order Status updated");
        } catch (IllegalStateException e) {
            return customStatusResponse.BADREQUEST400(e.getMessage());
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @PutMapping("/UpdateOrder/{orderID}")
    public ResponseEntity<OrderDTO> updateOrder(@PathVariable Long orderID, @RequestBody  OrderDTO orderDTO, BindingResult rs) {
        try {
            if(rs.hasErrors()){
                var errors = getDataErrorUtils.DataError(rs);
                return customStatusResponse.BADREQUEST400("Provider data is incorrect",errors);
            }
            OrderDTO updatedOrder = orderService.updateOrder(orderID, orderDTO);
            if (updatedOrder == null) {
                return customStatusResponse.NOTFOUND404("Order not found");
            }
            return customStatusResponse.OK200("Order updated", updatedOrder);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }
    @GetMapping("/create-payment/{orderId}")
    public ResponseEntity<String> createPayment(@PathVariable Long orderId) {
        try {
            OrderDTO order = orderService.getOrderById(orderId);
            if (order == null) {
                return customStatusResponse.NOTFOUND404("Order not found");
            }

            // Tạo thông tin thanh toán
            String vnp_TxnRef = String.valueOf(System.currentTimeMillis()); // mã giao dịch duy nhất
            String vnp_OrderInfo = "Thanh toan don hang " + orderId;
            String vnp_Amount = String.valueOf(order.getTotalPrice().longValue() * 100); // nhân 100 theo yêu cầu của VNPAY
            String vnp_IpAddr = "127.0.0.1"; // lấy IP thực nếu triển khai thật
            String vnp_Locale = "vn";
            String vnp_CurrCode = "VND";

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", VnPayConfig.vnp_Version);
            vnp_Params.put("vnp_Command", VnPayConfig.vnp_Command);
            vnp_Params.put("vnp_TmnCode", VnPayConfig.vnp_TmnCode);
            vnp_Params.put("vnp_Amount", vnp_Amount);
            vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", "other");
            vnp_Params.put("vnp_Locale", vnp_Locale);
            vnp_Params.put("vnp_ReturnUrl", VnPayConfig.vnp_ReturnUrl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            for (String fieldName : fieldNames) {
                String value = vnp_Params.get(fieldName);
                if ((value != null) && (!value.isEmpty())) {
                    hashData.append(fieldName).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=').append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString()));
                    if (!fieldName.equals(fieldNames.get(fieldNames.size() - 1))) {
                        hashData.append('&');
                        query.append('&');
                    }
                }
            }

            String secureHash = hmacSHA512(VnPayConfig.vnp_HashSecret, hashData.toString());
            query.append("&vnp_SecureHash=").append(secureHash);
            String paymentUrl = VnPayConfig.vnp_PayUrl + "?" + query;

            return customStatusResponse.OK200("Payment URL created", paymentUrl);

        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
	    }
	    private String hmacSHA512(String key, String data) throws Exception {
	        Mac hmac512 = Mac.getInstance("HmacSHA512");
	        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
	        hmac512.init(secretKeySpec);
	        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
	        return bytesToHex(bytes);
	    }
	
	    private String bytesToHex(byte[] bytes) {
	        StringBuilder sb = new StringBuilder();
	        for (byte b : bytes) {
	            sb.append(String.format("%02x", b));
	        }
	        return sb.toString();
	    }


}
