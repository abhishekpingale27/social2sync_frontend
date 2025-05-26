import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiClient from "../api/apiClient";
import {
  FaPaperPlane,
  FaLightbulb,
  FaCalendar,
  FaBullhorn,
  FaArrowLeft,
  FaSpinner,
  FaRobot,
  FaUser,
  FaRegCopy,
  FaHashtag,
  FaChartLine,
  FaArrowUp,
  FaBolt,
  FaRegThumbsUp,
  FaRegHeart,
  FaMagic,
  FaUserFriends
} from "react-icons/fa";
import { MdOutlineTipsAndUpdates, MdAutoAwesome } from "react-icons/md";
import { BsSendFill, BsStars } from "react-icons/bs";

const ChatSupport = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main Content Section */}
        <div className="flex-1 overflow-auto">
          <MainContent />
        </div>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

const MainContent = () => {
  const [chatActive, setChatActive] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Enhanced message sending with better error handling and authentication
  const handleSendMessage = async (messageText, context = null) => {
    if (!messageText.trim()) return;

    setChatActive(true);
    setShowSuggestions(false);
    
    const newUserMessage = { 
      text: messageText, 
      sender: "user", 
      timestamp: new Date().toISOString(),
      id: Date.now()
    };
    
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Use the enhanced chatbot endpoint
      const response = await apiClient.post("/chatbot/", {
        query: messageText,
        context: context,
        conversation_id: conversationId
      });

      const data = response.data;

      // Update conversation ID
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      const botMessage = {
        text: data.response,
        sender: "bot",
        timestamp: data.timestamp || new Date().toISOString(),
        suggestions: data.suggestions || [],
        responseTime: data.response_time,
        id: Date.now() + 1
      };

      setMessages([...newMessages, botMessage]);
      
      // Show success notification
      toast.success(
        `Response generated in ${data.response_time ? data.response_time.toFixed(1) : '~'}s!`, 
        { autoClose: 2000 }
      );

    } catch (error) {
      console.error("Chat error:", error);
      
      let errorMessage = "I'm having trouble connecting right now. Please try again!";
      
      if (error.response?.status === 401) {
        errorMessage = "Please sign in to continue our conversation.";
      } else if (error.response?.status === 429) {
        errorMessage = "I'm getting a lot of requests! Please wait a moment and try again.";
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }

      const errorBotMessage = {
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
        id: Date.now() + 1
      };

      setMessages([...newMessages, errorBotMessage]);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick suggestion handler
  const handleQuickSuggestion = async (category, niche = null, platform = null) => {
    try {
      setLoading(true);
      
      const response = await apiClient.post("/chatbot/quick-suggestions/", {
        category,
        niche,
        platform
      });

      const suggestionText = `Quick ${category.replace('_', ' ')} suggestions:`;
      await handleSendMessage(suggestionText);
      
      // The response will be handled by the regular message flow
      toast.info("Getting quick suggestions for you!");
      
    } catch (error) {
      console.error("Quick suggestion error:", error);
      toast.error("Failed to get quick suggestions. Try asking directly!");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copied to clipboard!", { autoClose: 1500 });
  };

  const handleSuggestionClick = (suggestion) => {
    // If it's a clickable suggestion from a bot response
    if (suggestion.startsWith('"') && suggestion.endsWith('"')) {
      const cleanSuggestion = suggestion.slice(1, -1);
      handleSendMessage(cleanSuggestion);
    } else {
      handleSendMessage(suggestion);
    }
  };

  return (
    <div className="h-full">
      {!chatActive ? (
        <div className="max-w-5xl mx-auto p-6 h-full flex flex-col">
          {/* Enhanced Title Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-full mr-3">
                <FaRobot className="text-white text-2xl" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SocialSync AI Assistant
                </span>
              </h1>
            </div>
            <p className="text-gray-600 text-lg mb-2">
              Your intelligent social media marketing companion
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <BsStars className="mr-2" />
              <span>Powered by advanced AI • Specialized for social media growth</span>
            </div>
          </div>

          {/* Enhanced Chat Suggestions */}
          <div className="flex-1 space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <ChatSuggestion
                icon={<FaLightbulb className="text-yellow-500 text-xl" />}
                title="Viral Content Ideas"
                description="Get AI-powered suggestions for your next viral post"
                suggestions={[
                  "Generate 5 viral Instagram Reel ideas for a fitness coach targeting busy professionals",
                  "Create trending TikTok content ideas for a small bakery business",
                  "Suggest engaging LinkedIn posts for a tech startup founder",
                  "What are some viral content formats I should try this month?"
                ]}
                color="yellow"
                onClick={handleSendMessage}
              />

              <ChatSuggestion
                icon={<FaHashtag className="text-blue-500 text-xl" />}
                title="Smart Hashtags & SEO"
                description="Discover trending hashtags and optimize your reach"
                suggestions={[
                  "Find the best hashtags for my sustainable fashion brand on Instagram",
                  "What hashtags are trending in the digital marketing space right now?",
                  "Help me create a hashtag strategy for my food blog",
                  "Suggest location-based hashtags for my local coffee shop"
                ]}
                color="blue"
                onClick={handleSendMessage}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ChatSuggestion
                icon={<FaCalendar className="text-green-500 text-xl" />}
                title="Content Calendar & Planning"
                description="Strategic planning for consistent social media presence"
                suggestions={[
                  "Create a 30-day content calendar for my wellness coaching business",
                  "Plan a holiday season social media strategy for an e-commerce store",
                  "What's the best posting schedule for maximum engagement?",
                  "Help me plan content around upcoming industry events"
                ]}
                color="green"
                onClick={handleSendMessage}
              />

              <ChatSuggestion
                icon={<FaChartLine className="text-purple-500 text-xl" />}
                title="Analytics & Growth"
                description="Optimize performance and accelerate your growth"
                suggestions={[
                  "How can I improve my Instagram engagement rate?",
                  "What metrics should I track for my LinkedIn business page?",
                  "Analyze why my recent posts aren't performing well",
                  "Create a strategy to gain 1000 followers this month"
                ]}
                color="purple"
                onClick={handleSendMessage}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <QuickActionCard
                icon={<FaBullhorn className="text-red-500" />}
                title="Ad Campaigns"
                description="Craft compelling ad copy"
                action={() => handleSendMessage("Help me create a high-converting Facebook ad campaign for my new product launch")}
              />

              <QuickActionCard
                icon={<FaArrowUp className="text-orange-500" />}
                title="Trending Topics"
                description="Stay ahead of trends"
                action={() => handleSendMessage("What are the hottest social media trends I should jump on right now?")}
              />

              <QuickActionCard
                icon={<FaUserFriends className="text-indigo-500" />}
                title="Community Building"
                description="Grow your audience"
                action={() => handleSendMessage("How can I build an engaged community around my brand on social media?")}
              />
            </div>
          </div>

          {/* Enhanced Pro Tips Section */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <MdOutlineTipsAndUpdates className="text-blue-600 text-xl mt-1" />
                <div>
                  <h3 className="font-medium text-blue-800 mb-2">Pro Tip</h3>
                  <p className="text-sm text-blue-600">
                    Be specific with your niche and target audience for personalized strategies. 
                    Example: "Instagram growth tips for a vegan restaurant targeting millennials in NYC"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <div className="flex items-start gap-3">
                <MdAutoAwesome className="text-purple-600 text-xl mt-1" />
                <div>
                  <h3 className="font-medium text-purple-800 mb-2">AI Feature</h3>
                  <p className="text-sm text-purple-600">
                    I can adapt my responses based on current trends, seasons, and platform updates. 
                    Ask me about the latest features on any social platform!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Chat Input */}
          <div className="mt-6 sticky bottom-6">
            <div className="relative shadow-xl rounded-2xl overflow-hidden bg-white border border-gray-200">
              <div className="flex items-center px-4 py-2 bg-gray-50 border-b">
                <FaMagic className="text-purple-500 mr-2" />
                <span className="text-sm text-gray-600 font-medium">Ask me anything about social media marketing...</span>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
                placeholder="e.g., 'Create viral content ideas for my photography business' or 'Best hashtags for fitness posts'"
                className="w-full p-4 pr-14 bg-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-base"
              />
              <button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim()}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition duration-200 ${
                  input.trim()
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <BsSendFill className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <ChatInterface
          messages={messages}
          input={input}
          setInput={setInput}
          handleSendMessage={handleSendMessage}
          setChatActive={setChatActive}
          loading={loading}
          copyToClipboard={copyToClipboard}
          handleSuggestionClick={handleSuggestionClick}
          showSuggestions={showSuggestions}
        />
      )}
    </div>
  );
};

const ChatInterface = ({
  messages,
  input,
  setInput,
  handleSendMessage,
  setChatActive,
  loading,
  copyToClipboard,
  handleSuggestionClick,
  showSuggestions
}) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Chat Header */}
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button
            onClick={() => setChatActive(false)}
            className="mr-3 text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition duration-200"
          >
            <FaArrowLeft className="text-lg" />
          </button>
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full mr-3">
              <FaRobot className="text-white text-lg" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 flex items-center">
                SocialSync AI
                <BsStars className="ml-2 text-purple-500 text-sm" />
              </h2>
              <p className="text-xs text-gray-500 flex items-center">
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-1" />
                    Crafting your response...
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Ready to help you grow
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-right">
          <div>Powered by AI</div>
          <div>{messages.length} messages</div>
        </div>
      </div>

      {/* Enhanced Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full inline-block mb-4">
                <FaRobot className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Ready to boost your social media?
              </h3>
              <p className="text-gray-500 mb-4">
                I'm your AI-powered social media strategist. Ask me about content creation, 
                growth strategies, trending topics, or any marketing challenge you're facing!
              </p>
              <div className="text-sm text-gray-400">
                💡 Try asking: "How can I get more engagement on Instagram?"
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] lg:max-w-[75%] relative group ${
                msg.sender === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`flex items-start ${
                  msg.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    msg.sender === "user"
                      ? "ml-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "mr-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700"
                  } p-2.5 rounded-full shadow-sm`}
                >
                  {msg.sender === "user" ? (
                    <FaUser className="text-sm" />
                  ) : (
                    <FaRobot className="text-sm" />
                  )}
                </div>
                <div
                  className={`relative px-5 py-4 rounded-2xl shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-tr-md"
                      : msg.isError
                      ? "bg-red-50 text-red-800 rounded-tl-md border border-red-200"
                      : "bg-white text-gray-800 rounded-tl-md border border-gray-200"
                  }`}
                >
                  {/* Message Text */}
                  <div className="prose prose-sm max-w-none">
                    {msg.text.split("\n").map((line, i) => (
                      <p key={i} className={`mb-2 last:mb-0 ${msg.sender === "user" ? "text-white" : ""}`}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Message Metadata */}
                  <div className={`text-xs mt-2 ${
                    msg.sender === "user" ? "text-blue-100" : "text-gray-400"
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.responseTime && (
                      <span className="ml-2">• {msg.responseTime.toFixed(1)}s</span>
                    )}
                  </div>

                  {/* Bot Suggestions */}
                  {msg.sender === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <FaBolt className="mr-1" />
                        Quick follow-ups:
                      </div>
                      <div className="space-y-1">
                        {msg.suggestions.slice(0, 3).map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="block w-full text-left text-xs p-2 bg-gray-50 hover:bg-blue-50 rounded-lg transition duration-200 text-gray-700 hover:text-blue-700"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className={`absolute -bottom-2 ${
                      msg.sender === "user" ? "-right-2" : "-left-2"
                    } bg-white text-gray-500 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition duration-200 hover:text-blue-600 border border-gray-200`}
                    title="Copy to clipboard"
                  >
                    <FaRegCopy className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Loading State */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[85%] lg:max-w-[75%]">
              <div className="flex-shrink-0 mr-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 p-2.5 rounded-full">
                <FaRobot className="text-sm" />
              </div>
              <div className="px-5 py-4 bg-white text-gray-800 rounded-2xl rounded-tl-md border border-gray-200 flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-gray-600">Analyzing your request...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Chat Input */}
      <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage(input)}
            placeholder="Ask about content ideas, strategies, trends, or any social media question..."
            className="w-full pl-4 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
            disabled={loading}
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || loading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-lg transition duration-200 ${
              input.trim() && !loading
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <FaSpinner className="text-lg animate-spin" />
            ) : (
              <BsSendFill className="text-lg" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ChatSuggestion = ({ icon, title, description, suggestions, color, onClick }) => {
  const colorClasses = {
    yellow: "from-yellow-50 to-orange-50 border-yellow-200 hover:border-yellow-300",
    blue: "from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300",
    green: "from-green-50 to-emerald-50 border-green-200 hover:border-green-300",
    purple: "from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300"
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl border-2 overflow-hidden shadow-sm hover:shadow-md transition duration-300`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="bg-white p-3 rounded-full shadow-sm">
            {icon}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <div className="space-y-2">
              {suggestions.map((text, index) => (
                <button
                  key={index}
                  className="w-full text-left p-3 bg-white/70 hover:bg-white rounded-lg text-sm transition duration-200 text-gray-700 hover:text-gray-900 border border-white/50 hover:border-gray-200 shadow-sm"
                  onClick={() => onClick(text)}
                >
                  <span className="text-gray-500 mr-2">💡</span>
                  "{text}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, action }) => {
  return (
    <button
      onClick={action}
      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition duration-200 text-left group"
    >
      <div className="flex items-center mb-2">
        <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition duration-200">
          {icon}
        </div>
      </div>
      <h3 className="font-medium text-gray-800 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{description}</p>
    </button>
  );
};

export default ChatSupport;
