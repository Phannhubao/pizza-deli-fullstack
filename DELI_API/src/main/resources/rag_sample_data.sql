-- =========================================================================
-- SCRIPT CẬP NHẬT DỮ LIỆU GIÀU THUỘC TÍNH (RAG KNOWLEDGE BASE) CHO PIZZA DELI
-- Đầy đủ 24 món ăn: Nguyên liệu, Độ cay, Độ béo phô mai, Calo, Dị ứng, Food Pairing
-- =========================================================================

-- 1. Đảm bảo cấu trúc cột metadata đã tồn tại
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS spicy_level INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cheese_level INT DEFAULT 3;
ALTER TABLE products ADD COLUMN IF NOT EXISTS calories INT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS serving_size VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_vegetarian BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS allergens VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasions VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS pairs_with VARCHAR(255);

-- 2. Cập nhật chi tiết từng sản phẩm theo ID

-- [ID 1] Pizza mix 4 vị
UPDATE products SET 
    description = 'Tuyệt tác kết hợp 4 phong cách đặc trưng nhất: Hải sản tươi giòn, Bò nướng sốt BBQ, 4 loại phô mai hảo hạng và Xúc xích Ý thơm lừng trên cùng một chiếc đế bánh giòn rụm.',
    ingredients = 'Tôm sú, mực tươi, thịt bò băm sốt BBQ khói, 4 loại phô mai (Mozzarella, Gorgonzola, Parmesan, Camembert), xúc xích Milano, lá quế tây',
    spicy_level = 1, cheese_level = 5, calories = 1150, serving_size = '3-4 người', is_vegetarian = false,
    allergens = 'Hải sản, Sữa/Lactose, Gluten', occasions = 'Tiệc gia đình, Bạn bè đông người, Muốn thử nhiều vị',
    pairs_with = 'Salad cá ngừ, cocacola'
WHERE product_id = 1;

-- [ID 2] salad cá ngừ
UPDATE products SET 
    description = 'Salad cá ngừ tươi thanh đạm kết hợp các loại rau xà lách thủy canh giòn ngọt, cà chua bi, quả ô liu đen và sốt dầu giấm chanh dây thơm dịu.',
    ingredients = 'Cá ngừ áp chảo, xà lách Roman, rocket, cà chua bi, trứng cút lòng đào, ô liu đen, sốt dấm táo chanh dây',
    spicy_level = 0, cheese_level = 1, calories = 320, serving_size = '1-2 người', is_vegetarian = false,
    allergens = 'Hải sản/Cá', occasions = 'Eat clean, Khai vị chống ngấy, Bữa ăn nhẹ, Giảm cân',
    pairs_with = 'Pizza Cá hồi xốt kem miso, sprite'
WHERE product_id = 2;

-- [ID 3] cocacola
UPDATE products SET 
    description = 'Nước ngọt có ga Coca-Cola ướp lạnh, giải ngấy tức thì khi thưởng thức cùng pizza phô mai béo ngậy.',
    ingredients = 'Nước khoáng có ga, hương cola tự nhiên',
    spicy_level = 0, cheese_level = 0, calories = 140, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Không', occasions = 'Mọi bữa ăn, Giải nhiệt nhanh',
    pairs_with = 'Pizza mix 4 vị, Mì Lasagna đút lò kèm phô mai Mozzarella'
WHERE product_id = 3;

-- [ID 4] sprite
UPDATE products SET 
    description = 'Nước giải khát Sprite hương chanh tươi thanh mát, sảng khoái và kích thích vị giác.',
    ingredients = 'Nước có ga, hương chanh tự nhiên',
    spicy_level = 0, cheese_level = 0, calories = 130, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Không', occasions = 'Hẹn hò, Trẻ em, Bữa ăn thanh nhẹ',
    pairs_with = 'Pizza Margherita, salad cá ngừ'
WHERE product_id = 4;

-- [ID 5] Pizza Margherita
UPDATE products SET 
    description = 'Pizza Margherita Napoli chuẩn phong cách cổ điển với sốt cà chua San Marzano đỏ mọng, phô mai Mozzarella tươi kéo sợi và lá húng quế tây thơm ngát.',
    ingredients = 'Phô mai tươi Mozzarella Fior di Latte, sốt cà chua hữu cơ, lá quế tây tươi (Basil), dầu ô liu nguyên chất Extra Virgin',
    spicy_level = 0, cheese_level = 4, calories = 780, serving_size = '2 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Cặp đôi, Trẻ em, Ăn chay phô mai, Thích vị thanh truyền thống',
    pairs_with = 'Khoai tây nướng nghiền, sprite'
WHERE product_id = 5;

-- [ID 6] Pizza Cá hồi xốt kem miso
UPDATE products SET 
    description = 'Tuyệt phẩm giao thoa ẩm thực Ý và Nhật Bản: Cá hồi Na Uy tươi béo mềm kết hợp nước xốt kem Miso ngọt thanh đặc trưng và rong biển nướng thơm phức.',
    ingredients = 'Cá hồi tươi áp chảo, xốt kem Miso Nhật Bản, phô mai Mozzarella, phô mai Ricotta, rong biển khô, hành boa-rô nướng',
    spicy_level = 0, cheese_level = 4, calories = 880, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Hải sản/Cá, Sữa/Lactose, Đậu nành, Gluten', occasions = 'Hẹn hò lãng mạn, Thưởng thức cao cấp, Gia đình',
    pairs_with = 'salad cá ngừ, Sữa chua xốt chanh dây (90g)'
WHERE product_id = 6;

-- [ID 7] Pudding kem trứng (90g)
UPDATE products SET 
    description = 'Tráng miệng pudding kem trứng mềm mịn tan ngay trên đầu lưỡi, phủ lớp sốt caramel thơm lừng vị đường thắng nhẹ.',
    ingredients = 'Sữa tươi thanh trùng, lòng đỏ trứng gà, kem tươi whipping cream, vani tự nhiên, caramel',
    spicy_level = 0, cheese_level = 2, calories = 180, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Trứng, Sữa/Lactose', occasions = 'Trẻ em, Tráng miệng ngọt nhẹ, Cặp đôi',
    pairs_with = 'Pizza Margherita, Mì Ý bò bằm và phô mai hun khói nhà làm'
WHERE product_id = 7;

-- [ID 8] Sữa chua kiểu Hy Lạp (90g)
UPDATE products SET 
    description = 'Sữa chua Hy Lạp lên men tự nhiên đặc quánh giàu đạm, vị chua nhẹ thanh tao rất tốt cho hệ tiêu hóa sau bữa ăn.',
    ingredients = 'Sữa tươi lên men, men vi sinh tự nhiên, không đường hóa học',
    spicy_level = 0, cheese_level = 2, calories = 130, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose', occasions = 'Eat clean, Tốt cho tiêu hóa, Ăn kiêng',
    pairs_with = 'salad cá ngừ, Mì Ý nghêu và xốt quế tây'
WHERE product_id = 8;

-- [ID 9] Sữa chua xốt dâu (90g)
UPDATE products SET 
    description = 'Sữa chua dẻo thơm kết hợp xốt mứt dâu tây Đà Lạt chua chua ngọt ngọt kích thích vị giác.',
    ingredients = 'Sữa tươi lên men, mứt dâu tây tươi nấu thủ công, đường mía tự nhiên',
    spicy_level = 0, cheese_level = 1, calories = 160, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose', occasions = 'Trẻ em, Cặp đôi hẹn hò, Tráng miệng',
    pairs_with = 'Pizza Hawaiian, Mì Ý Tôm tỏi cay'
WHERE product_id = 9;

-- [ID 10] Sữa chua xốt chanh dây (90g)
UPDATE products SET 
    description = 'Vị béo ngậy dịu dàng của sữa chua nhà làm hòa quyện hoàn hảo cùng xốt chanh dây nhiệt đới thơm lừng, chua thanh giải ngấy.',
    ingredients = 'Sữa tươi lên men, nước cốt chanh dây vàng tươi, hạt chia, đường phèn',
    spicy_level = 0, cheese_level = 1, calories = 150, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose', occasions = 'Cặp đôi, Giải ngấy sau bữa pizza phô mai, Eat clean',
    pairs_with = 'Pizza Cá hồi xốt kem miso, Pizza mix 4 vị'
WHERE product_id = 10;

-- [ID 11] Bánh matcha pudding (90g)
UPDATE products SET 
    description = 'Pudding trà xanh Matcha Uji Nhật Bản đậm vị trà, đắng nhẹ hậu ngọt sâu lắng, béo thơm nước cốt sữa dừa.',
    ingredients = 'Bột Matcha Uji nguyên chất, sữa tươi, kem tươi, gelatin hữu cơ',
    spicy_level = 0, cheese_level = 2, calories = 170, serving_size = '1 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose', occasions = 'Thưởng thức trà, Tráng miệng thanh lịch',
    pairs_with = 'Pizza Sò điệp Hokkaido Gratin với xốt Miso ngọt'
WHERE product_id = 11;

-- [ID 12] Mì Ý nghêu và xốt quế tây
UPDATE products SET 
    description = 'Mì Ý sợi linguine xào cùng nghêu tươi ngọt nước biển, hòa quyện xốt rượu vang trắng và hương quế tây nồng nàn quyến rũ.',
    ingredients = 'Mì linguine, nghêu tươi hấp rượu vang, tỏi phi, dầu ô liu, lá quế tây tươi (Basil), ớt bột nhẹ',
    spicy_level = 1, cheese_level = 1, calories = 580, serving_size = '1-2 người', is_vegetarian = false,
    allergens = 'Hải sản/Nghêu, Gluten', occasions = 'Bữa trưa công sở, Cặp đôi, Thích hải sản thanh nhẹ',
    pairs_with = 'Sữa chua kiểu Hy Lạp (90g), sprite'
WHERE product_id = 12;

-- [ID 13] Khoai tây nướng nghiền
UPDATE products SET 
    description = 'Khoai tây nướng bọc giấy bạc nghiền nhuyễn mịn cùng bơ lạt thơm lừng, phủ phô mai Mozzarella đút lò vàng ruộm.',
    ingredients = 'Khoai tây vàng Đà Lạt, bơ lạt Anchor, phô mai Mozzarella nướng cháy cạnh, tiêu đen, kem béo',
    spicy_level = 0, cheese_level = 4, calories = 340, serving_size = '1-2 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose', occasions = 'Trẻ em cực thích, Khai vị gia đình, Bữa ăn ấm cúng',
    pairs_with = 'Pizza Margherita, cocacola'
WHERE product_id = 13;

-- [ID 14] Thịt nguội cuộn lá Rocket và phô mai Ricotta (1 cuộn)
UPDATE products SET 
    description = 'Khai vị tinh tế chuẩn Địa Trung Hải: Lát thịt heo muối Ý mặn mà ôm trọn phô mai Ricotta ngọt béo và lá rocket tươi xanh cay the.',
    ingredients = 'Thịt heo muối Parma Ham cắt lát mỏng, phô mai tươi Ricotta tự làm, lá rocket hữu cơ, mật ong rừng, hạt tiêu',
    spicy_level = 0, cheese_level = 3, calories = 160, serving_size = '1 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose', occasions = 'Khai vị cao cấp, Nhậu nhẹt, Hẹn hò tinh tế',
    pairs_with = 'Pizza Thịt nguội Ý Parma và rau rocket với xốt cà chua, cocacola'
WHERE product_id = 14;

-- [ID 15] Mì Ý xốt cà chua với phô mai Mascarpone nhà làm
UPDATE products SET 
    description = 'Sự kết hợp ngọt ngào giữa mì Ý Al Dente sốt cà chua truyền thống và từng viên phô mai tươi Mascarpone tự làm béo ngậy mềm mượt như tuyết.',
    ingredients = 'Mì Spaghetti, sốt cà chua Marinara hầm chậm, phô mai tươi Mascarpone nhà làm, dầu ô liu, lá oregano',
    spicy_level = 0, cheese_level = 4, calories = 640, serving_size = '1-2 người', is_vegetarian = true,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Trẻ em, Ăn chay phô mai, Người mê phô mai béo',
    pairs_with = 'Khoai tây nướng nghiền, Pudding kem trứng (90g)'
WHERE product_id = 15;

-- [ID 16] Mì Ý bò bằm và phô mai hun khói nhà làm
UPDATE products SET 
    description = 'Mì Ý Bolognese sốt bò bằm đậm đà ninh nhừ trong nhiều giờ, rắc ngập phô mai Scamorza hun khói thơm lừng đặc trưng.',
    ingredients = 'Mì Spaghetti, thịt bò Úc băm nhuyễn, sốt cà chua hầm rượu đỏ, phô mai hun khói Scamorza tự làm, tỏi, cần tây',
    spicy_level = 0, cheese_level = 3, calories = 720, serving_size = '1-2 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Gia đình, Trẻ em, Bữa ăn no đủ chất, Văn phòng',
    pairs_with = 'cocacola, Pudding kem trứng (90g)'
WHERE product_id = 16;

-- [ID 17] Mì Lasagna đút lò kèm phô mai Mozzarella
UPDATE products SET 
    description = 'Món mì đút lò trứ danh nước Ý với từng lớp lá mì xếp xen kẽ sốt thịt bò bằm đậm vị và sốt kem trắng Bechamel, phủ lớp phô mai nướng xém thơm nức mũi.',
    ingredients = 'Lá mì Lasagna, thịt bò băm sốt cà chua, sốt Bechamel kem béo, phô mai Mozzarella và Parmesan đút lò',
    spicy_level = 0, cheese_level = 5, calories = 790, serving_size = '1-2 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Tín đồ cuồng phô mai, Bữa tối ấm cúng, Hẹn hò',
    pairs_with = 'salad cá ngừ, cocacola'
WHERE product_id = 17;

-- [ID 18] Mì Ý Tôm tỏi cay
UPDATE products SET 
    description = 'Mì Ý sốt Aglio e Olio tỏi ớt phi thơm vàng giòn rụm cùng những chú tôm sú tươi rói ngọt thịt, vị cay nồng kích thích mọi giác quan.',
    ingredients = 'Mì Spaghetti, tôm sú tươi lột vỏ, tỏi cô đơn phi vàng, ớt khô Ý băm nhuyễn, dầu ô liu Extra Virgin, mùi tây',
    spicy_level = 2, cheese_level = 1, calories = 590, serving_size = '1-2 người', is_vegetarian = false,
    allergens = 'Hải sản/Tôm, Gluten', occasions = 'Người thích cay, Bữa trưa nhanh, Tụ tập bạn bè',
    pairs_with = 'sprite, Sữa chua xốt dâu (90g)'
WHERE product_id = 18;

-- [ID 19] Pizza Thịt nguội Ý Parma và rau rocket với xốt cà chua
UPDATE products SET 
    description = 'Dòng pizza tinh hoa ẩm thực Ý: Thịt heo muối Parma ủ 18 tháng thái mỏng manh, trải đều trên nền sốt cà chua và phô mai dẻo quánh, ăn kèm rau rocket the mát.',
    ingredients = 'Thịt heo muối Parma Ham nhập khẩu, rau rocket (Arugula) tươi giòn, sốt cà chua, phô mai Mozzarella, phô mai Parmesan bào nhuyễn',
    spicy_level = 0, cheese_level = 3, calories = 840, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Hẹn hò lãng mạn, Uống bia/rượu vang, Người sành ăn',
    pairs_with = 'Thịt nguội cuộn lá Rocket và phô mai Ricotta (1 cuộn), cocacola'
WHERE product_id = 19;

-- [ID 20] Pizza Margherita với xúc xích Ý Milano và xúc xích cay Chorizo
UPDATE products SET 
    description = 'Sự bùng nổ của 2 dòng xúc xích đẳng cấp: Xúc xích Milano Salami béo ngậy ngọt thịt kết hợp xúc xích Chorizo cay the nồng đượm vị ớt bột xông khói Tây Ban Nha.',
    ingredients = 'Xúc xích Ý Milano Salami, xúc xích cay Chorizo, phô mai Mozzarella, sốt cà chua San Marzano, tiêu đen',
    spicy_level = 2, cheese_level = 4, calories = 960, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Xem bóng đá, Tiệc nhậu uống bia, Tụ tập bạn bè, Thích cay',
    pairs_with = 'Khoai tây nướng nghiền, cocacola'
WHERE product_id = 20;

-- [ID 21] Pizza Hải sản xốt cà chua cay với phô mai hun khói
UPDATE products SET 
    description = 'Hải sản tươi ngon gồm tôm, mực, nghêu thấm đẫm xốt cà chua cay nồng đặc sắc, phủ lớp phô mai xông khói thơm nồng hương gỗ sồi.',
    ingredients = 'Tôm sú, mực ống, thịt nghêu, xốt cà chua cay sốt ớt habanero nhẹ, phô mai hun khói Scamorza, phô mai Mozzarella',
    spicy_level = 2, cheese_level = 4, calories = 870, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Hải sản (Tôm, Mực, Nghêu), Sữa/Lactose, Gluten', occasions = 'Mê hải sản cay, Tụ tập bạn bè cuối tuần, Tiệc tùng',
    pairs_with = 'sprite, Sữa chua xốt chanh dây (90g)'
WHERE product_id = 21;

-- [ID 22] Pizza Hawaiian
UPDATE products SET 
    description = 'Món pizza yêu thích của mọi gia đình: Sự kết hợp hoàn hảo giữa vị chua ngọt nhiệt đới của dứa mật chín và thịt giăm bông mặn mà thơm bơ cùng phô mai kéo sợi.',
    ingredients = 'Thịt nguội giăm bông (Ham), dứa mật nướng chua ngọt, ngô ngọt, phô mai Mozzarella, sốt cà chua mịn màng',
    spicy_level = 0, cheese_level = 3, calories = 790, serving_size = '2 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Trẻ em yêu thích, Tiệc sinh nhật gia đình, Dễ ăn cho mọi lứa tuổi',
    pairs_with = 'Khoai tây nướng nghiền, Sữa chua xốt dâu (90g)'
WHERE product_id = 22;

-- [ID 23] Pizza Thịt bò cay kiểu Kebab
UPDATE products SET 
    description = 'Đột phá hương vị Trung Đông trên đế bánh Ý: Thịt bò tẩm ướp thảo mộc Kebab nướng xém lửa, rưới xốt tỏi cay đặc biệt và hành tây tím giòn ngọt.',
    ingredients = 'Thịt bò ướp gia vị Kebab, ớt sừng cay, hành tây tím, cà chua nướng, xốt tỏi cay Kebab, phô mai Mozzarella',
    spicy_level = 3, cheese_level = 3, calories = 920, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Sữa/Lactose, Gluten', occasions = 'Người ghiền ăn cay, Đàn ông tụ tập xem bóng đá, Nhậu bia',
    pairs_with = 'cocacola, salad cá ngừ'
WHERE product_id = 23;

-- [ID 24] Pizza Sò điệp Hokkaido Gratin với xốt Miso ngọt
UPDATE products SET 
    description = 'Món pizza hải sản cao cấp: Sò điệp tươi nhập khẩu từ vùng biển lạnh Hokkaido ngọt lịm, nướng Gratin xém vàng cùng xốt Miso ngọt dịu dàng và nấm mỡ tươi.',
    ingredients = 'Sò điệp Hokkaido Nhật Bản, nấm mỡ tươi, xốt kem Miso ngọt Gratin, phô mai Mozzarella, phô mai Parmesan, hành lá rắc',
    spicy_level = 0, cheese_level = 4, calories = 830, serving_size = '2-3 người', is_vegetarian = false,
    allergens = 'Hải sản/Sò điệp, Sữa/Lactose, Đậu nành, Gluten', occasions = 'Hẹn hò sang trọng, Kỷ niệm ngày cưới, Thưởng thức ẩm thực fusion',
    pairs_with = 'salad cá ngừ, Bánh matcha pudding (90g)'
WHERE product_id = 24;
