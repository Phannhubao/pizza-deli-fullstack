import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaShoppingBag,
  FaRedoAlt,
  FaMagic,
  FaFire
} from "react-icons/fa";
import Swal from "sweetalert2";
import { Domain } from "../../services/Domain";
import { useCart, normalizeImagePath } from "../../context/CartContext";
import "../../css/ragAssistant.css";

const DEFAULT_PRESETS = [
  {
    id: "couple_dinner",
    title: "💑 Bữa tối 2 người (< 350k)",
    prompt: "Tư vấn bữa tối lãng mạn 2 người, không gian ấm cúng, thích phô mai béo ngậy, ngân sách dưới 350k",
    people: 2,
    budget: 350000,
    occasion: "Cặp đôi",
  },
  {
    id: "family_kids",
    title: "👨‍👩‍👧‍👦 Gia đình có bé nhỏ",
    prompt: "Gợi ý bữa ăn cho gia đình có 2 bé nhỏ, bánh mềm ngọt, tuyệt đối không cay",
    people: 4,
    budget: 450000,
    occasion: "Gia đình, Trẻ em",
    spicyPreference: 0,
  },
  {
    id: "eat_clean",
    title: "🥗 Eat Clean / Ít calo",
    prompt: "Thực đơn ít calo, nhiều rau xanh thanh đạm, giảm béo",
    people: 1,
    budget: 200000,
    occasion: "Eat clean",
  },
  {
    id: "party_beer",
    title: "🍺 Nhậu / Xem bóng đá",
    prompt: "Combo tiệc bạn bè xem bóng đá đậm đà, cay vừa, nhiều thịt nướng",
    people: 3,
    budget: 450000,
    occasion: "Tiệc tùng, Nhậu/Bia",
    spicyPreference: 2,
  },
  {
    id: "quick_lunch",
    title: "⚡ Bữa trưa nhanh (< 100k)",
    prompt: "Bữa trưa 1 người nhanh gọn tiết kiệm kèm nước ngọt mát lạnh",
    people: 1,
    budget: 100000,
    occasion: "Văn phòng",
  },
];

const RAGMenuAssistant = () => {
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Lịch sử tin nhắn
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      sender: "ai",
      text: "👋 Xin chào! Tôi là **Deli AI Concierge** - Trợ lý ẩm thực cá nhân hóa sử dụng công nghệ **RAG**.\n\nHôm nay bạn muốn thưởng thức món gì? Bạn có thể nhập bất cứ yêu cầu nào (ví dụ: *'Tìm combo 2 người thèm hải sản'*, *'Món cay nhiều phô mai'*, *'Bữa trưa dưới 100k'*) hoặc chọn gợi ý nhanh bên dưới nhé!",
      showPresets: true,
    },
  ]);

  // Cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Gửi request RAG
  const executeRAG = async (queryText, presetMeta = {}) => {
    if (!queryText.trim()) return;

    // Thêm tin nhắn của User vào danh sách
    const userMsgId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: "user",
        text: queryText,
      },
    ]);

    setInputMessage("");
    setLoading(true);

    const storedUser = localStorage.getItem("user");
    let userId = null;
    try {
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userId = u.id || u.userId || null;
      }
    } catch {
      userId = null;
    }

    const payload = {
      userId: userId,
      userPrompt: queryText,
      numberOfPeople: presetMeta.people || null,
      maxBudget: presetMeta.budget || null,
      spicyPreference: presetMeta.spicyPreference !== undefined ? presetMeta.spicyPreference : null,
      isVegetarian: presetMeta.isVegetarian !== undefined ? presetMeta.isVegetarian : null,
      occasion: presetMeta.occasion || null,
    };

    try {
      const response = await axios.post(`${Domain}/api/recommendations/rag`, payload);
      const data = response.data;

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai-result",
          recommendation: data,
        },
      ]);
    } catch (err) {
      console.error("Lỗi khi gọi RAG recommendation:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "ai",
          text: "Xin lỗi quý khách, hệ thống AI đang bận xử lý hoặc kết nối gián đoạn. Bạn vui lòng thử lại nhé!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Submit từ input
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;
    executeRAG(inputMessage);
  };

  // Bấm Preset
  const handleSelectPreset = (preset) => {
    executeRAG(preset.prompt, preset);
  };

  // Reset cuộc trò chuyện
  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome",
        sender: "ai",
        text: "👋 Cuộc trò chuyện đã được làm mới. Hôm nay bạn muốn ăn món gì cùng Pizza Deli?",
        showPresets: true,
      },
    ]);
  };

  // Thêm 1 món vào giỏ hàng
  const handleAddSingleItem = (item) => {
    addToCart(
      {
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        image: item.imageUrl || "img/default-product.png",
      },
      item.quantity || 1
    );

    Swal.fire({
      icon: "success",
      title: "Đã thêm món!",
      text: `${item.productName} (x${item.quantity || 1})`,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  // Thêm trọn combo vào giỏ hàng
  const handleAddAllCombo = (items) => {
    if (!items || !items.length) return;

    items.forEach((item) => {
      addToCart(
        {
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          image: item.imageUrl || "img/default-product.png",
        },
        item.quantity || 1
      );
    });

    Swal.fire({
      icon: "success",
      title: "Tuyệt vời!",
      text: `Đã thêm trọn bộ combo (${items.length} món) vào giỏ hàng của bạn!`,
      confirmButtonText: "Xem giỏ hàng",
      showCancelButton: true,
      cancelButtonText: "Tiếp tục đặt món",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = "/cart";
      }
    });
  };

  return (
    <>
      {/* 1. NÚT NỔI Ở GÓC MÀN HÌNH (FLOATING ACTION BUTTON) */}
      <div className="rag-fab-container">
        {!isOpen && (
          <div className="rag-fab-pill" onClick={() => setIsOpen(true)}>
            <FaMagic style={{ color: "#ffb800" }} />
            <span>Trợ lý AI Đề xuất</span>
          </div>
        )}

        <button
          type="button"
          className={`rag-fab-button ${isOpen ? "is-open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Đóng Chatbot" : "Mở Trợ lý AI Đề xuất thực đơn"}
        >
          {isOpen ? <FaTimes /> : <FaRobot />}
          {!isOpen && <span className="rag-fab-badge">RAG</span>}
        </button>
      </div>

      {/* 2. CỬA SỔ CHATBOT POPUP (MỞ RA MỞ VÔ) */}
      {isOpen && (
        <div className="rag-chat-window">
          {/* Header */}
          <div className="rag-chat-header">
            <div className="rag-header-left">
              <div className="rag-avatar-wrapper">
                <FaRobot />
                <span className="rag-online-dot"></span>
              </div>
              <div className="rag-header-info">
                <h4>Deli AI Concierge</h4>
                <p>
                  <span>●</span> Trực tuyến • Công nghệ RAG
                </p>
              </div>
            </div>

            <div className="rag-header-actions">
              <button
                type="button"
                className="rag-icon-btn"
                onClick={handleResetChat}
                title="Làm mới cuộc trò chuyện"
              >
                <FaRedoAlt />
              </button>
              <button
                type="button"
                className="rag-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ / Đóng"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body chat messages */}
          <div className="rag-chat-body">
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="rag-msg user">
                    <div className="rag-msg-bubble">{msg.text}</div>
                  </div>
                );
              }

              if (msg.sender === "ai") {
                return (
                  <div key={msg.id} className="rag-msg ai">
                    <div className="rag-msg-avatar">
                      <FaRobot />
                    </div>
                    <div className="rag-msg-bubble">
                      <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>

                      {/* Gợi ý nhanh 1-chạm */}
                      {msg.showPresets && (
                        <div className="rag-quick-presets">
                          {DEFAULT_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="rag-quick-chip"
                              onClick={() => handleSelectPreset(p)}
                            >
                              {p.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              if (msg.sender === "ai-result" && msg.recommendation) {
                const rec = msg.recommendation;
                const hasItems = Array.isArray(rec.recommendedItems) && rec.recommendedItems.length > 0;

                // Nếu là tin nhắn chào hỏi / trò chuyện chung (không có món đề xuất)
                if (!hasItems) {
                  return (
                    <div key={msg.id} className="rag-msg ai">
                      <div className="rag-msg-avatar">
                        <FaRobot />
                      </div>
                      <div className="rag-msg-bubble">
                        <div style={{ whiteSpace: "pre-line" }}>{rec.reasoning}</div>
                        <div className="rag-quick-presets" style={{ marginTop: "10px" }}>
                          {DEFAULT_PRESETS.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="rag-quick-chip"
                              onClick={() => handleSelectPreset(p)}
                            >
                              {p.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="rag-msg ai" style={{ maxWidth: "98%" }}>
                    <div className="rag-msg-avatar">
                      <FaRobot />
                    </div>
                    <div className="rag-msg-bubble" style={{ width: "100%", padding: "10px" }}>
                      <div className="rag-chat-result">
                        <div className="rag-chat-quote" style={{ whiteSpace: "pre-line" }}>
                          "{rec.reasoning}"
                        </div>

                        <div className="rag-chat-combo-title">
                          <span>
                            {rec.suggestedOccasion?.includes("Tra cứu") || rec.suggestedOccasion?.includes("Danh sách") ? "📋 " : "Dịp: "}
                            <strong>{rec.suggestedOccasion || "Bữa ăn cùng Deli"}</strong>
                          </span>
                          <span className="rag-chat-total">
                            {Number(rec.estimatedTotalPrice || 0).toLocaleString("vi-VN")} ₫
                          </span>
                        </div>

                        {rec.discountOrVoucherNote && (
                          <div style={{ fontSize: "0.75rem", color: "#10b981", marginBottom: "8px" }}>
                            🎟️ {rec.discountOrVoucherNote}
                          </div>
                        )}

                        {/* Danh sách món ăn trong combo */}
                        <div className="rag-chat-items-list">
                          {rec.recommendedItems?.map((item) => (
                            <div key={item.productId} className="rag-chat-item-row">
                              <img
                                src={normalizeImagePath(item.imageUrl || "img/default-product.png")}
                                alt={item.productName}
                                className="rag-chat-item-thumb"
                                onError={(e) => {
                                  e.target.src = "img/default-product.png";
                                }}
                              />
                              <div className="rag-chat-item-info">
                                <div className="rag-chat-item-name">
                                  {item.productName} <span style={{ color: "#ffb800" }}>x{item.quantity || 1}</span>
                                </div>
                                <div className="rag-chat-item-sub">
                                  {item.calories ? `${item.calories} kcal • ` : ""}
                                  {item.spicyLevel !== undefined && (
                                    <span>
                                      <FaFire style={{ color: "#ef4444" }} /> Cay {item.spicyLevel}/3
                                    </span>
                                  )}
                                </div>
                                <div className="rag-chat-item-price">
                                  {Number(item.price || 0).toLocaleString("vi-VN")} ₫
                                </div>
                              </div>
                              <button
                                type="button"
                                className="rag-chat-btn-add-item"
                                onClick={() => handleAddSingleItem(item)}
                              >
                                + Giỏ
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Nút thêm trọn combo hoặc tất cả món */}
                        <button
                          type="button"
                          className="rag-chat-btn-add-all"
                          onClick={() => handleAddAllCombo(rec.recommendedItems)}
                        >
                          <FaShoppingBag />{" "}
                          {rec.suggestedOccasion?.includes("Tra cứu") || rec.suggestedOccasion?.includes("Danh sách")
                            ? "Thêm Tất Cả Món Vào Giỏ Hàng"
                            : "Thêm Cả Combo Vào Giỏ Hàng"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="rag-msg ai">
                <div className="rag-msg-avatar">
                  <FaRobot />
                </div>
                <div className="rag-msg-bubble">
                  <div className="rag-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer chat input */}
          <div className="rag-chat-footer">
            <form onSubmit={handleSendMessage}>
              <div className="rag-input-wrapper">
                <input
                  type="text"
                  className="rag-chat-input"
                  placeholder="Nhắn yêu cầu của bạn (VD: Tìm combo 2 người thèm hải sản)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="rag-chat-send-btn"
                  disabled={loading || !inputMessage.trim()}
                  title="Gửi tin nhắn"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </form>
            <div style={{ textAlign: "center", marginTop: "6px", fontSize: "0.72rem", color: "#64748b" }}>
              <span>⚡ Trợ lý ẩm thực RAG AI gợi ý thực đơn thông minh</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RAGMenuAssistant;
