import React, { useState, useContext } from "react";
const PREFIX = "lens.dev/dm";
import { MainContext } from "../context";
import {
  client as apolloClient,
  getDefaultProfile,
  getProfile,
} from "../query";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";

const buildConversationId = (profileIdA, profileIdB) => {
  const profileIdAParsed = parseInt(profileIdA, 16);
  const profileIdBParsed = parseInt(profileIdB, 16);
  return profileIdAParsed < profileIdBParsed
    ? `${PREFIX}/${profileIdA}-${profileIdB}`
    : `${PREFIX}/${profileIdB}-${profileIdA}`;
};

export default function create() {
  let [lensHandle, setLensHandle] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { address } = useAccount();

  const { client } = useContext(MainContext);

  async function createMessage() {
    ///Check Handle and Message
    if (!lensHandle || !message) return;
    if (!lensHandle.includes(".lens")) {
      lensHandle = lensHandle + ".lens";
    }

    console.log(address, lensHandle, message);

    /// get the profile with the Address of the current user
    const {
      data: { defaultProfile },
    } = await apolloClient.query({
      query: getDefaultProfile,
      variables: {
        address,
      },
    });

    /// get the profile by the Handle of the new user , convo to be sent
    const {
      data: { profile },
    } = await apolloClient.query({
      query: getProfile,
      variables: {
        lensHandle,
      },
    });

    /// Create A New Convo
    const conversation = await client.conversation.newConversation(
      profile.ownedBy,
      {
        conversationId: buildConversationId(defaultProfile.id, profile.id),
        metadata: {},
      }
    );

    // send the messages
    await conversation.send(message);

    /// push the user back to home
    router.push("/");
  }
  return (
    <div>
      <h1>Create a New message</h1>
      <button onClick={() => createMessage()}>createMessage</button>
      <h3>Lens Handle</h3>
      <input
        placeholder="0xdhruv.lens"
        onChange={(e) => setLensHandle(e.target.value)}
      />
      <h3>Message</h3>
      <input
        placeholder="hello..."
        onChange={(e) => setMessage(e.target.value)}
      />
    </div>
  );
}
