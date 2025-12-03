I used AI to help me fix small bugs in my code. Here is the relevant log:

Connection established
Connection a8beabe0-a784-4ba4-923e-fdcb9d8943eb connected to Chat:default
Chat message request
Chat message response
Connection established
Connection 1ea93bd7-a418-4cc5-9bc7-4a92b4bd1dfe connected to Chat:default
Connection established
Connection 8bf83adf-f777-4cf2-837a-5a0cc9448e01 connected to Chat:default
Chat message request
Chat message response
Chat message request
Error on server: Error: jsonSchema not initialized.
    at MCPClientManager.getAITools (/mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/chunk-6BEZ37YT.js:12328:33)
    at Chat.onChatMessage (/mnt/d/repos/cf-agent/src/server.ts:47:19)
    at Chat.<anonymous> (/mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/chunk-6BEZ37YT.js:13664:39)
    at /mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/chunk-6BEZ37YT.js:13671:21
    at Chat.<anonymous> (/mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/chunk-6BEZ37YT.js:13665:25)
    at /mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/agents_ai-chat-agent.js:151:41
    at Chat._tryCatchChat (/mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/agents_ai-chat-agent.js:386:20)
    at Chat.AIChatAgent.onMessage (/mnt/d/repos/cf-agent/node_modules/.vite/deps_agents_starter/agents_ai-chat-agent.js:150:23)
Override onError(error) to handle server errors

What is causing this?