$headers = @{ "Content-Type" = "application/json" }

# 1. Lấy thông tin sản phẩm ban đầu
$prodBefore = Invoke-RestMethod -Uri "http://localhost:8080/api/products/4" -Method GET
$stockBefore = [int]$prodBefore.stock
Write-Host "Product 4 before order: Stock = $stockBefore"

# 2. Tạo đơn hàng
$orderBody = @{
    phone_number = "0987654321"
    address = "123 Test Stock Str"
    username = "StockTester"
    quantity = 2
    totalPrice = 300000
    userId = 1
} | ConvertTo-Json

$orderRes = Invoke-RestMethod -Uri "http://localhost:8080/api/Order/AddOrder" -Method POST -Headers $headers -Body $orderBody
Write-Host "Raw AddOrder response:" ($orderRes | ConvertTo-Json -Depth 2)

$orderId = $orderRes.data.orderId
if (-not $orderId) { $orderId = $orderRes.orderId }
if (-not $orderId) { $orderId = $orderRes.id }
Write-Host "Parsed Order ID = $orderId"

# 3. Tạo OrderDetail với 2 phần Product 4
$detailBody = "[{`"orderId`":$orderId,`"productId`":4,`"quantity`":2,`"price`":150000,`"produc_name`":`"$($prodBefore.productName)`"}]"

$detailRes = Invoke-RestMethod -Uri "http://localhost:8080/api/OrderDeTail/AddOrderDetailList" -Method POST -Headers $headers -Body $detailBody
Write-Host "OrderDetail created successfully."

# 4. Kiểm tra stock sau khi đặt hàng
$prodAfter = Invoke-RestMethod -Uri "http://localhost:8080/api/products/4" -Method GET
$stockAfter = [int]$prodAfter.stock
Write-Host "Product 4 after order (bought 2): Stock = $stockAfter (Expected: $($stockBefore - 2))"

# 5. Hủy đơn hàng và kiểm tra khôi phục tồn kho
$cancelBody = '"CANCELLED"'
$cancelRes = Invoke-RestMethod -Uri "http://localhost:8080/api/Order/UpdateStatusOrder/$orderId" -Method PUT -Headers $headers -Body $cancelBody
Write-Host "Order status updated to CANCELLED."

# 6. Kiểm tra stock sau khi hủy
$prodRestored = Invoke-RestMethod -Uri "http://localhost:8080/api/products/4" -Method GET
$stockRestored = [int]$prodRestored.stock
Write-Host "Product 4 after order cancelled: Stock = $stockRestored (Expected: $stockBefore)"
