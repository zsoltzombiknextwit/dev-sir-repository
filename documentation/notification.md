# Notification Control using PowerApps Component Framework and Azure SignalR

> Source: [Microsoft Power Platform Blog – Rui Santos, September 27, 2019](https://www.microsoft.com/en-us/power-platform/blog/power-apps/notification-control-using-powerapps-component-framework-and-azure-signalr/)

---

## Summary: Azure SignalR

**Azure SignalR Service** is a fully managed, cloud-hosted service that enables real-time, bidirectional communication between servers and connected clients (browsers, mobile apps, desktop apps, etc.) using the **SignalR** protocol.

### Key Concepts

| Concept | Description |
|---|---|
| **WebSockets** | The preferred transport protocol used by SignalR for low-latency, persistent connections. Falls back to Server-Sent Events or long polling when WebSockets are unavailable. |
| **Hub** | A high-level pipeline on the server that dispatches messages to/from clients. Clients call server-side hub methods and vice versa. |
| **Connection negotiation** | Each client calls a `/negotiate` endpoint (typically an Azure Function) to obtain a connection token from the SignalR Service. |
| **Serverless mode** | Azure SignalR can be used without a persistent server — Azure Functions handle negotiation and message broadcasting, making the architecture event-driven and cost-efficient. |
| **Scale-out** | The managed service handles connection scaling automatically, removing the need to maintain a SignalR backplane (e.g., Redis). |

### How It Works in This Architecture

```
PowerApp (PCF Control)
       |
       |  1. POST /negotiate  (Azure Function)
       v
Azure SignalR Service  <----->  Azure Function (message broadcast)
       |
       |  2. Push "newMessage" event via WebSocket
       v
All connected PowerApp clients (real-time)
```

1. The PCF (PowerApps Component Framework) control uses the `@aspnet/signalr` TypeScript client to connect to an **Azure Function-backed SignalR hub**.
2. The Azure Function exposes two endpoints:
   - `/negotiate` — returns a connection token so clients can join the hub.
   - `/messages` — accepts an HTTP POST and broadcasts the payload to all connected clients as a `newMessage` event.
3. Any connected client (another PowerApp tab, a D365 module, or any system) receives the message in real time via the persistent WebSocket connection.

### Why Azure SignalR Instead of Self-Hosted SignalR

- No infrastructure to manage — Microsoft handles connection management, scaling, and availability.
- Integrates natively with **Azure Functions** for a fully serverless architecture.
- CORS configuration on the Azure Function App controls which origins (PowerApps domains, D365 org URLs) are permitted to connect.

---

## Article Walkthrough

### Part 1: Create the PCF Component

1. Scaffold the PCF project:
   ```bash
   pac pcf init --namespace my.NotificationNamespace --name NotificationControl --template field
   npm install
   npm install @aspnet/signalr
   ```

2. Define these properties in `ControlManifest.Input.xml`:
   - **Input:** `SignalRHubConnectionUrl`, `MessageToSend`
   - **Output:** `MessageReceivedType`, `MessageReceivedText`, `MessageReceivedSender`

3. Implement `index.ts` logic:
   - `init()` — Build and start the SignalR `HubConnection`; register the `newMessage` event handler.
   - `updateView()` — When `MessageToSend` changes, HTTP POST the payload to the SignalR hub URL.
   - `getOutputs()` — Expose `MessageReceivedText`, `MessageReceivedType`, `MessageReceivedSender` back to PowerApps.
   - `destroy()` — Stop the SignalR connection.

4. Package and push to CDS:
   ```bash
   pac solution init --publisher-name developer --publisher-prefix dev
   pac solution add-reference --path C:\NotificationComponent
   msbuild /t:restore
   msbuild
   pac pcf push --publisher-prefix dev
   ```

### Part 2: Configure Azure SignalR

1. Create an **Azure SignalR Service** in the Azure Portal, then copy the **connection string** from the *Keys* blade.
2. Clone the serverless chat quickstart and configure `local.settings.json` with `AzureSignalRConnectionString`.
3. Deploy the Azure Function App to Azure:
   - Add the connection string as an **Application Setting**.
   - Configure **CORS** to allow the following origins:
     ```
     https://eu.create.powerapps.com
     https://content.powerapps.com
     https://your_org_name.crm4.dynamics.com
     https://127.0.0.1:8181  (local dev)
     ```

### Part 3: Canvas PowerApp Integration

1. Enable *PowerApps component framework* experimental features.
2. Import the packaged PCF component into the canvas app.
3. Insert the `NotificationControl` component onto a screen and set `SignalRHubConnectionUrl` to the deployed Azure Function URL.
4. Bind a button's `OnSelect` to update `MessageToSend`:
   ```powerapps
   Set(MessageToSend, JSON({ sender: "image", text: TextInput2.Text, type: "test" }))
   ```
5. Map the component's output properties (`MessageReceivedText`, `MessageReceivedType`, `MessageReceivedSender`) to labels or variables.

Opening the published app in two browser tabs demonstrates real-time messaging between PowerApps instances.

---

## Resources

- [PowerApps Component Framework community forum](https://aka.ms/PCFForum)
- [PCF getting started blog](https://aka.ms/PCFBlog)
- [Vote for / file feature ideas](https://aka.ms/PCFIdea)
- [Community components, demos, blogs](https://aka.ms/PCFDemos)
- [Azure SignalR + Azure Functions quickstart](https://docs.microsoft.com/en-us/azure/azure-signalr/signalr-quickstart-azure-functions-javascript)
- [SignalR TypeScript client (npm)](https://www.npmjs.com/package/@aspnet/signalr)
