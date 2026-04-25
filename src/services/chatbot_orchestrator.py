import os
from typing import TypedDict, Annotated, Sequence, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_google_genai import ChatGoogleGenerativeAI
from src.config.settings import settings
from src.services.tools.search_tools import mcp_tools

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], "The messages in the conversation"]
    intent: str
    user_id: str

class ChatbotOrchestrator:
    def __init__(self):
        # Initialize LLM with tool binding
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash-lite",
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2
        )
        self.llm_with_tools = self.llm.bind_tools(mcp_tools)
        
        # Build the graph
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)

        # 1. Add Nodes
        workflow.add_node("intent_parser", self._intent_parser_node)
        workflow.add_node("handle_reservation", self._handle_reservation_node)
        workflow.add_node("handle_complaint", self._handle_complaint_node)
        workflow.add_node("mcp_brain", self._mcp_brain_node)
        workflow.add_node("execute_tools", ToolNode(mcp_tools))

        # 2. Add Edges & Conditional Routing
        workflow.add_edge(START, "intent_parser")
        
        workflow.add_conditional_edges(
            "intent_parser",
            self._route_by_intent,
            {
                "reservation": "handle_reservation",
                "complaint": "handle_complaint",
                "general": "mcp_brain",
            }
        )

        # Brain can call tools or finish
        workflow.add_conditional_edges(
            "mcp_brain",
            self._should_continue_to_tools,
            {
                "continue": "execute_tools",
                "end": END
            }
        )

        # After tool execution, go back to brain to summarize
        workflow.add_edge("execute_tools", "mcp_brain")

        # Reservation and Complaint paths lead to end
        workflow.add_edge("handle_reservation", END)
        workflow.add_edge("handle_complaint", END)

        return workflow.compile()

    # --- Nodes Logic ---

    async def _intent_parser_node(self, state: AgentState):
        """Analyze intent using the diagram's 'Intent Parser' logic."""
        last_message = state["messages"][-1].content
        
        # Extract text if content is multimodal (list)
        text_content = last_message
        if isinstance(last_message, list):
            text_content = next((item["text"] for item in last_message if item.get("type") == "text"), "")

        prompt = f"""You are the Intent Parser for SkyBlue Hotel.
        Classify the following user request into:
        - 'reservation': Booking, checking, or room availability.
        - 'complaint': Reporting issues or dissatisfaction.
        - 'general': Everything else (chat, search, facts, info).

        User Request: {text_content}
        Return only the category name.
        """
        response = await self.llm.ainvoke(prompt)
        intent = response.content.strip().lower()
        if intent not in ["reservation", "complaint", "general"]:
            intent = "general"
        return {"intent": intent}

    def _route_by_intent(self, state: AgentState):
        return state["intent"]

    async def _handle_reservation_node(self, state: AgentState):
        """Structured path for hotel reservations."""
        last_message = state["messages"][-1].content
        text_content = next((item["text"] for item in last_message if item.get("type") == "text"), "") if isinstance(last_message, list) else last_message
        
        response = await self.llm.ainvoke(
            f"Act as a professional reservation agent. Help with: {text_content}"
        )
        return {"messages": [AIMessage(content=response.content)]}

    async def _handle_complaint_node(self, state: AgentState):
        """Structured path for customer complaints."""
        last_message = state["messages"][-1].content
        text_content = next((item["text"] for item in last_message if item.get("type") == "text"), "") if isinstance(last_message, list) else last_message
        
        response = await self.llm.ainvoke(
            f"Act as an empathetic customer service manager. Respond to: {text_content}"
        )
        return {"messages": [AIMessage(content=response.content)]}

    async def _mcp_brain_node(self, state: AgentState):
        """The core 'Brain System' that decides whether to search or answer directly."""
        messages = state["messages"]
        response = await self.llm_with_tools.ainvoke(messages)
        return {"messages": [response]}

    def _should_continue_to_tools(self, state: AgentState):
        """Check if the LLM requested any tools."""
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "continue"
        return "end"

    async def process_message(self, message: str, user_id: str, image_base64: str = None) -> str:
        """Main entry point for FastAPI."""
        if image_base64:
            content = [
                {"type": "text", "text": message},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}}
            ]
            human_msg = HumanMessage(content=content)
        else:
            human_msg = HumanMessage(content=message)

        initial_state = {
            "messages": [human_msg],
            "user_id": user_id,
            "intent": ""
        }
        
        result = await self.graph.ainvoke(initial_state)
        
        # Get the final AI message from the state
        final_msg = result["messages"][-1]
        return final_msg.content

# Singleton instance
chatbot = ChatbotOrchestrator()


