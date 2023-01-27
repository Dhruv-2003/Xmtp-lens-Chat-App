import { useContext, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { MainContext } from "../../context";
import { SortDirection, Message } from "@xmtp/xmtp-js";
import { useAccount } from "wagmi";

export default Conversation = async () => {
  const { currentConversation } = useContext(MainContext);
  const { address } = useAccount();
  const router = useRouter();
  const { id } = router.query;

  const [message, setMessage] = useState("");
  let [messages, setMessages] = useState({});
  const messagesRef = useRef({});

  useEffect(() => {
    if (!currentConversation) {
      router.push("/");
    } else {
      fetchMessages();
      listen();
    }
  }, []);

  /// Listen to all the new messages from the stream
  async function listen() {
    const stream = await currentConversation.streamMessages();
    for await (const newMessage of stream) {
      // set the new messages to show
      messagesRef.current[newMessage.id] = newMessage;
      setMessages({ ...messagesRef.current });
    }
  }

  /// fetch all the past 100 messages for the convo
  async function fetchMessages() {
    try {
      //get
      const newMessages = await currentConversation.messages({
        limit: 100,
        direction: SortDirection.SORT_DIRECTION_ASCENDING,
      });

      /// set the messages
      newMessages.map((message) => (messagesRef.current[message.id] = message));
      setMessages(messagesRef.current);
    } catch (err) {
      console.log("error fetching messages...", err);
    }
  }

  /// Send a Message
  async function createMessage() {
    await currentConversation.send(message);
    console.log("message sent...");
    setMessage("");
  }

  if (!Object.values(messages).length) return;
  //// reversing the array to show the current message first
  const messagesAsArray = Object.values(messages).reverse();

  return (
    <>
      <div>
        <h1>{id}</h1>
        <div>
          <input />
          <button>
            <h3>Send</h3>
          </button>
        </div>
        {messagesAsArray.map((message) => {
          <div
            key={message.id}
            style={checkIfSenderContainer(address, message.senderAddress)}
          >
            <p>{message.content}</p>
          </div>;
        })}
      </div>
    </>
  );
};

function checkIfSenderContainer(owner, sender) {
  if (owner.toLowerCase() !== sender.toLowerCase()) {
    return {
      alignItems: "flex-end",
    };
  } else {
    return { alignItems: "flex-start" };
  }
}
