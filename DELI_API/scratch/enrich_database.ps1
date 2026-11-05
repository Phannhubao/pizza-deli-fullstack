# Script nạp dữ liệu phong phú chuẩn RAG cho toàn bộ 24 món ăn trong cơ sở dữ liệu Pizza Deli

$products = @(
    @{
        id = 1; name = "Pizza mix 4 vị"; cat = 1; price = 450000; stock = 1500
        desc = "Tuyệt tác kết hợp 4 phong cách đặc trưng nhất: Hải sản tươi giòn, Bò nướng sốt BBQ, 4 loại phô mai hảo hạng và Xúc xích Ý thơm lừng trên cùng một chiếc đế bánh giòn rụm."
        ing = "Tôm sú, mực tươi, thịt bò băm sốt BBQ khói, 4 loại phô mai (Mozzarella, Gorgonzola, Parmesan, Camembert), xúc xích Milano, lá quế tây"
        spicy = 1; cheese = 5; cal = 1150; size = "3-4 người"; veg = $false
        allg = "Hải sản, Sữa/Lactose, Gluten"
        occ = "Tiệc gia đình, Bạn bè đông người, Muốn thử nhiều vị"
        pairs = "Salad cá ngừ, cocacola"
    },
    @{
        id = 2; name = "salad cá ngừ"; cat = 5; price = 180000; stock = 1500
        desc = "Salad cá ngừ tươi thanh đạm kết hợp các loại rau xà lách thủy canh giòn ngọt, cà chua bi, quả ô liu đen và sốt dầu giấm chanh dây thơm dịu."
        ing = "Cá ngừ áp chảo, xà lách Roman, rocket, cà chua bi, trứng cút lòng đào, ô liu đen, sốt dấm táo chanh dây"
        spicy = 0; cheese = 1; cal = 320; size = "1-2 người"; veg = $false
        allg = "Hải sản/Cá"
        occ = "Eat clean, Khai vị chống ngấy, Bữa ăn nhẹ, Giảm cân"
        pairs = "Pizza Cá hồi xốt kem miso, sprite"
    },
    @{
        id = 3; name = "cocacola"; cat = 2; price = 25000; stock = 1500
        desc = "Nước ngọt có ga Coca-Cola ướp lạnh, giải ngấy tức thì khi thưởng thức cùng pizza phô mai béo ngậy."
        ing = "Nước khoáng có ga, hương cola tự nhiên"
        spicy = 0; cheese = 0; cal = 140; size = "1 người"; veg = $true
        allg = "Không"
        occ = "Mọi bữa ăn, Giải nhiệt nhanh"
        pairs = "Pizza mix 4 vị, Mì Lasagna đút lò kèm phô mai Mozzarella"
    },
    @{
        id = 4; name = "sprite"; cat = 2; price = 25000; stock = 1500
        desc = "Nước giải khát Sprite hương chanh tươi thanh mát, sảng khoái và kích thích vị giác."
        ing = "Nước có ga, hương chanh tự nhiên"
        spicy = 0; cheese = 0; cal = 130; size = "1 người"; veg = $true
        allg = "Không"
        occ = "Hẹn hò, Trẻ em, Bữa ăn thanh nhẹ"
        pairs = "Pizza Margherita, salad cá ngừ"
    },
    @{
        id = 5; name = "Pizza Margherita"; cat = 1; price = 380000; stock = 1500
        desc = "Pizza Margherita Napoli chuẩn phong cách cổ điển với sốt cà chua San Marzano đỏ mọng, phô mai Mozzarella tươi kéo sợi và lá húng quế tây thơm ngát."
        ing = "Phô mai tươi Mozzarella Fior di Latte, sốt cà chua hữu cơ, lá quế tây tươi (Basil), dầu ô liu nguyên chất Extra Virgin"
        spicy = 0; cheese = 4; cal = 780; size = "2 người"; veg = $true
        allg = "Sữa/Lactose, Gluten"
        occ = "Cặp đôi, Trẻ em, Ăn chay phô mai, Thích vị thanh truyền thống"
        pairs = "Khoai tây nướng nghiền, sprite"
    },
    @{
        id = 6; name = "Pizza Cá hồi xốt kem miso"; cat = 1; price = 400000; stock = 1500
        desc = "Tuyệt phẩm giao thoa ẩm thực Ý và Nhật Bản: Cá hồi Na Uy tươi béo mềm kết hợp nước xốt kem Miso ngọt thanh đặc trưng và rong biển nướng thơm phức."
        ing = "Cá hồi tươi áp chảo, xốt kem Miso Nhật Bản, phô mai Mozzarella, phô mai Ricotta, rong biển khô, hành boa-rô nướng"
        spicy = 0; cheese = 4; cal = 880; size = "2-3 người"; veg = $false
        allg = "Hải sản/Cá, Sữa/Lactose, Đậu nành, Gluten"
        occ = "Hẹn hò lãng mạn, Thưởng thức cao cấp, Gia đình"
        pairs = "salad cá ngừ, Sữa chua xốt chanh dây (90g)"
    },
    @{
        id = 7; name = "Pudding kem trứng (90g)"; cat = 6; price = 36000; stock = 1500
        desc = "Tráng miệng pudding kem trứng mềm mịn tan ngay trên đầu lưỡi, phủ lớp sốt caramel thơm lừng vị đường thắng nhẹ."
        ing = "Sữa tươi thanh trùng, lòng đỏ trứng gà, kem tươi whipping cream, vani tự nhiên, caramel"
        spicy = 0; cheese = 2; cal = 180; size = "1 người"; veg = $true
        allg = "Trứng, Sữa/Lactose"
        occ = "Trẻ em, Tráng miệng ngọt nhẹ, Cặp đôi"
        pairs = "Pizza Margherita, Mì Ý bò bằm và phô mai hun khói nhà làm"
    },
    @{
        id = 8; name = "Sữa chua kiểu Hy Lạp (90g)"; cat = 6; price = 40000; stock = 1500
        desc = "Sữa chua Hy Lạp lên men tự nhiên đặc quánh giàu đạm, vị chua nhẹ thanh tao rất tốt cho hệ tiêu hóa sau bữa ăn."
        ing = "Sữa tươi lên men, men vi sinh tự nhiên, không đường hóa học"
        spicy = 0; cheese = 2; cal = 130; size = "1 người"; veg = $true
        allg = "Sữa/Lactose"
        occ = "Eat clean, Tốt cho tiêu hóa, Ăn kiêng"
        pairs = "salad cá ngừ, Mì Ý nghêu và xốt quế tây"
    },
    @{
        id = 9; name = "Sữa chua xốt dâu (90g)"; cat = 6; price = 37000; stock = 1500
        desc = "Sữa chua dẻo thơm kết hợp xốt mứt dâu tây Đà Lạt chua chua ngọt ngọt kích thích vị giác."
        ing = "Sữa tươi lên men, mứt dâu tây tươi nấu thủ công, đường mía tự nhiên"
        spicy = 0; cheese = 1; cal = 160; size = "1 người"; veg = $true
        allg = "Sữa/Lactose"
        occ = "Trẻ em, Cặp đôi hẹn hò, Tráng miệng"
        pairs = "Pizza Hawaiian, Mì Ý Tôm tỏi cay"
    },
    @{
        id = 10; name = "Sữa chua xốt chanh dây (90g)"; cat = 6; price = 45000; stock = 1500
        desc = "Vị béo ngậy dịu dàng của sữa chua nhà làm hòa quyện hoàn hảo cùng xốt chanh dây nhiệt đới thơm lừng, chua thanh giải ngấy."
        ing = "Sữa tươi lên men, nước cốt chanh dây vàng tươi, hạt chia, đường phèn"
        spicy = 0; cheese = 1; cal = 150; size = "1 người"; veg = $true
        allg = "Sữa/Lactose"
        occ = "Cặp đôi, Giải ngấy sau bữa pizza phô mai, Eat clean"
        pairs = "Pizza Cá hồi xốt kem miso, Pizza mix 4 vị"
    },
    @{
        id = 11; name = "Bánh matcha pudding (90g)"; cat = 6; price = 29000; stock = 1500
        desc = "Pudding trà xanh Matcha Uji Nhật Bản đậm vị trà, đắng nhẹ hậu ngọt sâu lắng, béo thơm nước cốt sữa dừa."
        ing = "Bột Matcha Uji nguyên chất, sữa tươi, kem tươi, gelatin hữu cơ"
        spicy = 0; cheese = 2; cal = 170; size = "1 người"; veg = $true
        allg = "Sữa/Lactose"
        occ = "Thưởng thức trà, Tráng miệng thanh lịch"
        pairs = "Pizza Sò điệp Hokkaido Gratin với xốt Miso ngọt"
    },
    @{
        id = 12; name = "Mì Ý nghêu và xốt quế tây"; cat = 4; price = 180000; stock = 1500
        desc = "Mì Ý sợi linguine xào cùng nghêu tươi ngọt nước biển, hòa quyện xốt rượu vang trắng và hương quế tây nồng nàn quyến rũ."
        ing = "Mì linguine, nghêu tươi hấp rượu vang, tỏi phi, dầu ô liu, lá quế tây tươi (Basil), ớt bột nhẹ"
        spicy = 1; cheese = 1; cal = 580; size = "1-2 người"; veg = $false
        allg = "Hải sản/Nghêu, Gluten"
        occ = "Bữa trưa công sở, Cặp đôi, Thích hải sản thanh nhẹ"
        pairs = "Sữa chua kiểu Hy Lạp (90g), sprite"
    },
    @{
        id = 13; name = "Khoai tây nướng nghiền"; cat = 3; price = 72000; stock = 1500
        desc = "Khoai tây nướng bọc giấy bạc nghiền nhuyễn mịn cùng bơ lạt thơm lừng, phủ phô mai Mozzarella đút lò vàng ruộm."
        ing = "Khoai tây vàng Đà Lạt, bơ lạt Anchor, phô mai Mozzarella nướng cháy cạnh, tiêu đen, kem béo"
        spicy = 0; cheese = 4; cal = 340; size = "1-2 người"; veg = $true
        allg = "Sữa/Lactose"
        occ = "Trẻ em cực thích, Khai vị gia đình, Bữa ăn ấm cúng"
        pairs = "Pizza Margherita, cocacola"
    },
    @{
        id = 14; name = "Thịt nguội cuộn lá Rocket và phô mai Ricotta (1 cuộn)"; cat = 3; price = 44000; stock = 1500
        desc = "Khai vị tinh tế chuẩn Địa Trung Hải: Lát thịt heo muối Ý mặn mà ôm trọn phô mai Ricotta ngọt béo và lá rocket tươi xanh cay the."
        ing = "Thịt heo muối Parma Ham cắt lát mỏng, phô mai tươi Ricotta tự làm, lá rocket hữu cơ, mật ong rừng, hạt tiêu"
        spicy = 0; cheese = 3; cal = 160; size = "1 người"; veg = $false
        allg = "Sữa/Lactose"
        occ = "Khai vị cao cấp, Nhậu nhẹt, Hẹn hò tinh tế"
        pairs = "Pizza Thịt nguội Ý Parma và rau rocket với xốt cà chua, cocacola"
    },
    @{
        id = 15; name = "Mì Ý xốt cà chua với phô mai Mascarpone nhà làm"; cat = 4; price = 150000; stock = 1500
        desc = "Sự kết hợp ngọt ngào giữa mì Ý Al Dente sốt cà chua truyền thống và từng viên phô mai tươi Mascarpone tự làm béo ngậy mềm mượt như tuyết."
        ing = "Mì Spaghetti, sốt cà chua Marinara hầm chậm, phô mai tươi Mascarpone nhà làm, dầu ô liu, lá oregano"
        spicy = 0; cheese = 4; cal = 640; size = "1-2 người"; veg = $true
        allg = "Sữa/Lactose, Gluten"
        occ = "Trẻ em, Ăn chay phô mai, Người mê phô mai béo"
        pairs = "Khoai tây nướng nghiền, Pudding kem trứng (90g)"
    },
    @{
        id = 16; name = "Mì Ý bò bằm và phô mai hun khói nhà làm"; cat = 4; price = 168000; stock = 1500
        desc = "Mì Ý Bolognese sốt bò bằm đậm đà ninh nhừ trong nhiều giờ, rắc ngập phô mai Scamorza hun khói thơm lừng đặc trưng."
        ing = "Mì Spaghetti, thịt bò Úc băm nhuyễn, sốt cà chua hầm rượu đỏ, phô mai hun khói Scamorza tự làm, tỏi, cần tây"
        spicy = 0; cheese = 3; cal = 720; size = "1-2 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Gia đình, Trẻ em, Bữa ăn no đủ chất, Văn phòng"
        pairs = "cocacola, Pudding kem trứng (90g)"
    },
    @{
        id = 17; name = "Mì Lasagna đút lò kèm phô mai Mozzarella"; cat = 4; price = 178000; stock = 1500
        desc = "Món mì đút lò trứ danh nước Ý với từng lớp lá mì xếp xen kẽ sốt thịt bò bằm đậm vị và sốt kem trắng Bechamel, phủ lớp phô mai nướng xém thơm nức mũi."
        ing = "Lá mì Lasagna, thịt bò băm sốt cà chua, sốt Bechamel kem béo, phô mai Mozzarella và Parmesan đút lò"
        spicy = 0; cheese = 5; cal = 790; size = "1-2 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Tín đồ cuồng phô mai, Bữa tối ấm cúng, Hẹn hò"
        pairs = "salad cá ngừ, cocacola"
    },
    @{
        id = 18; name = "Mì Ý Tôm tỏi cay"; cat = 4; price = 188000; stock = 1500
        desc = "Mì Ý sốt Aglio e Olio tỏi ớt phi thơm vàng giòn rụm cùng những chú tôm sú tươi rói ngọt thịt, vị cay nồng kích thích mọi giác quan."
        ing = "Mì Spaghetti, tôm sú tươi lột vỏ, tỏi cô đơn phi vàng, ớt khô Ý băm nhuyễn, dầu ô liu Extra Virgin, mùi tây"
        spicy = 2; cheese = 1; cal = 590; size = "1-2 người"; veg = $false
        allg = "Hải sản/Tôm, Gluten"
        occ = "Người thích cay, Bữa trưa nhanh, Tụ tập bạn bè"
        pairs = "sprite, Sữa chua xốt dâu (90g)"
    },
    @{
        id = 19; name = "Pizza Thịt nguội Ý Parma và rau rocket với xốt cà chua"; cat = 1; price = 330000; stock = 1500
        desc = "Dòng pizza tinh hoa ẩm thực Ý: Thịt heo muối Parma ủ 18 tháng thái mỏng manh, trải đều trên nền sốt cà chua và phô mai dẻo quánh, ăn kèm rau rocket the mát."
        ing = "Thịt heo muối Parma Ham nhập khẩu, rau rocket (Arugula) tươi giòn, sốt cà chua, phô mai Mozzarella, phô mai Parmesan bào nhuyễn"
        spicy = 0; cheese = 3; cal = 840; size = "2-3 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Hẹn hò lãng mạn, Uống bia/rượu vang, Người sành ăn"
        pairs = "Thịt nguội cuộn lá Rocket và phô mai Ricotta (1 cuộn), cocacola"
    },
    @{
        id = 20; name = "Pizza Margherita với xúc xích Ý Milano và xúc xích cay Chorizo"; cat = 1; price = 250000; stock = 1500
        desc = "Sự bùng nổ của 2 dòng xúc xích đẳng cấp: Xúc xích Milano Salami béo ngậy ngọt thịt kết hợp xúc xích Chorizo cay the nồng đượm vị ớt bột xông khói Tây Ban Nha."
        ing = "Xúc xích Ý Milano Salami, xúc xích cay Chorizo, phô mai Mozzarella, sốt cà chua San Marzano, tiêu đen"
        spicy = 2; cheese = 4; cal = 960; size = "2-3 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Xem bóng đá, Tiệc nhậu uống bia, Tụ tập bạn bè, Thích cay"
        pairs = "Khoai tây nướng nghiền, cocacola"
    },
    @{
        id = 21; name = "Pizza Hải sản xốt cà chua cay với phô mai hun khói"; cat = 1; price = 300000; stock = 1500
        desc = "Hải sản tươi ngon gồm tôm, mực, nghêu thấm đẫm xốt cà chua cay nồng đặc sắc, phủ lớp phô mai xông khói thơm nồng hương gỗ sồi."
        ing = "Tôm sú, mực ống, thịt nghêu, xốt cà chua cay sốt ớt habanero nhẹ, phô mai hun khói Scamorza, phô mai Mozzarella"
        spicy = 2; cheese = 4; cal = 870; size = "2-3 người"; veg = $false
        allg = "Hải sản (Tôm, Mực, Nghêu), Sữa/Lactose, Gluten"
        occ = "Mê hải sản cay, Tụ tập bạn bè cuối tuần, Tiệc tùng"
        pairs = "sprite, Sữa chua xốt chanh dây (90g)"
    },
    @{
        id = 22; name = "Pizza Hawaiian"; cat = 1; price = 240000; stock = 1500
        desc = "Món pizza yêu thích của mọi gia đình: Sự kết hợp hoàn hảo giữa vị chua ngọt nhiệt đới của dứa mật chín và thịt giăm bông mặn mà thơm bơ cùng phô mai kéo sợi."
        ing = "Thịt nguội giăm bông (Ham), dứa mật nướng chua ngọt, ngô ngọt, phô mai Mozzarella, sốt cà chua mịn màng"
        spicy = 0; cheese = 3; cal = 790; size = "2 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Trẻ em yêu thích, Tiệc sinh nhật gia đình, Dễ ăn cho mọi lứa tuổi"
        pairs = "Khoai tây nướng nghiền, Sữa chua xốt dâu (90g)"
    },
    @{
        id = 23; name = "Pizza Thịt bò cay kiểu Kebab"; cat = 1; price = 360000; stock = 1500
        desc = "Đột phá hương vị Trung Đông trên đế bánh Ý: Thịt bò tẩm ướp thảo mộc Kebab nướng xém lửa, rưới xốt tỏi cay đặc biệt và hành tây tím giòn ngọt."
        ing = "Thịt bò ướp gia vị Kebab, ớt sừng cay, hành tây tím, cà chua nướng, xốt tỏi cay Kebab, phô mai Mozzarella"
        spicy = 3; cheese = 3; cal = 920; size = "2-3 người"; veg = $false
        allg = "Sữa/Lactose, Gluten"
        occ = "Người ghiền ăn cay, Đàn ông tụ tập xem bóng đá, Nhậu bia"
        pairs = "cocacola, salad cá ngừ"
    },
    @{
        id = 24; name = "Pizza Sò điệp Hokkaido Gratin với xốt Miso ngọt"; cat = 1; price = 320000; stock = 1500
        desc = "Món pizza hải sản cao cấp: Sò điệp tươi nhập khẩu từ vùng biển lạnh Hokkaido ngọt lịm, nướng Gratin xém vàng cùng xốt Miso ngọt dịu dàng và nấm mỡ tươi."
        ing = "Sò điệp Hokkaido Nhật Bản, nấm mỡ tươi, xốt kem Miso ngọt Gratin, phô mai Mozzarella, phô mai Parmesan, hành lá rắc"
        spicy = 0; cheese = 4; cal = 830; size = "2-3 người"; veg = $false
        allg = "Hải sản/Sò điệp, Sữa/Lactose, Đậu nành, Gluten"
        occ = "Hẹn hò sang trọng, Kỷ niệm ngày cưới, Thưởng thức ẩm thực fusion"
        pairs = "salad cá ngừ, Bánh matcha pudding (90g)"
    }
)

Write-Host "Bắt đầu cập nhật 24 sản phẩm trong PostgreSQL..."
$successCount = 0

foreach ($p in $products) {
    $payload = @{
        productName = $p.name
        price = $p.price
        stock = $p.stock
        description = $p.desc
        ingredients = $p.ing
        spicyLevel = $p.spicy
        cheeseLevel = $p.cheese
        calories = $p.cal
        servingSize = $p.size
        isVegetarian = $p.veg
        allergens = $p.allg
        occasions = $p.occ
        pairsWith = $p.pairs
        active = $true
        category = @{ categoryId = $p.cat }
    } | ConvertTo-Json -Compress

    try {
        $res = Invoke-RestMethod -Uri "http://localhost:8080/api/products/$($p.id)" -Method PUT -ContentType "application/json; charset=utf-8" -Body ([System.Text.Encoding]::UTF8.GetBytes($payload))
        Write-Host "✅ [$($p.id)] $($p.name) - Thành công!"
        $successCount++
    } catch {
        Write-Host "❌ [$($p.id)] $($p.name) - Lỗi: $_"
    }
}

Write-Host "Hoàn tất cập nhật: $successCount / $($products.Count) sản phẩm!"
