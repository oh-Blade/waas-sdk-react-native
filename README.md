基于我对代码的分析，让我详细回答您的问题：

Search files...

Ran tool

Read file: example/src/config.json
基于我对代码的深入分析，我可以明确回答您的问题：

## **是的，这个 SDK 构建的应用必须依赖 Coinbase 的服务**

### 核心依赖分析

1. **硬编码的 Coinbase API 端点**
   - 所有服务都指向 Coinbase 的 WaaS API：
     - `https://api.developer.coinbase.com/waas/pools`
     - `https://api.developer.coinbase.com/waas/mpc_keys` 
     - `https://api.developer.coinbase.com/waas/mpc_wallets`

2. **必需的 Coinbase 认证**
   - 需要 Coinbase Cloud API Key 和私钥
   - 在直连模式下，这些凭据直接用于访问 Coinbase 服务
   - 在代理模式下，代理服务器仍需要这些凭据来访问 Coinbase 后端

### 两种运行模式的依赖情况

#### **直连模式 (Direct Mode)**
```typescript
// 直接连接到 Coinbase WaaS API
const mpcKeyServiceWaaSUrl = "https://api.developer.coinbase.com/waas/mpc_keys"
```
- 应用直接与 Coinbase 服务通信
- 需要在应用中配置 Coinbase API 凭据

#### **代理模式 (Proxy Mode)** 
```typescript
// 通过代理服务器连接
const proxyUrl = "http://localhost:8091"
```
- 应用连接到您的代理服务器
- **但代理服务器仍然需要连接到 Coinbase 后端服务**
- 只是将 Coinbase 依赖从客户端转移到了服务器端

### 关键服务依赖

1. **MPC 操作**: 多方计算需要 Coinbase 的 MPC 基础设施
2. **设备注册**: 设备必须在 Coinbase 系统中注册
3. **钱包管理**: 钱包创建和管理依赖 Coinbase 的 WaaS 服务
4. **交易签名**: 分布式签名需要 Coinbase 的 MPC 网络

### 无法脱离 Coinbase 的原因

1. **专有的 MPC 实现**: SDK 使用 Coinbase 专有的多方计算协议
2. **服务端状态管理**: 设备组、钱包等状态存储在 Coinbase 服务器
3. **安全基础设施**: 密钥分片和安全存储依赖 Coinbase 的基础设施
4. **协议兼容性**: MPC 协议需要与 Coinbase 的其他节点协作

### 总结

**这个 SDK 是 Coinbase WaaS (Wallet-as-a-Service) 的客户端实现，本质上是 Coinbase 钱包服务的移动端接口。** 无论使用哪种模式，最终都必须依赖 Coinbase 的后端服务来实现核心的钱包功能。

如果您需要完全独立的钱包解决方案，您可能需要考虑：
- 其他开源的钱包 SDK
- 自建的钱包基础设施
- 其他提供商的 WaaS 解决方案

但如果选择使用这个 SDK，就必须接受对 Coinbase 服务的依赖。
-----------------------------------------------------------------
# React Native WaaS SDK

This is the repository for the mobile React Native SDK for Wallet-as-a-Service APIs.
It exposes a subset of the WaaS APIs to the mobile developer and, in particular, is
required for the completion of MPC operations such as Seed generation and Transaction signing.

### Prerequisites:

- [node 18+](https://nodejs.org/en/download/)
- [yarn classic 1.22+](https://classic.yarnpkg.com/en/docs/install)

For iOS development:
- [Xcode 14.0+](https://developer.apple.com/xcode/)
  - iOS15.2+ simulator (iPhone 14 recommended)
- [CocoaPods](https://guides.cocoapods.org/using/getting-started.html)
- [make](https://www.gnu.org/software/make/)

For Android development:
- [Android Studio](https://developer.android.com/studio)
  - x86_64 Android emulator running Android 30+ (Pixel 5 running S recommended)
  - [Android NDK](https://developer.android.com/ndk)
- [Java 8](https://www.java.com/en/download)
  - [Java JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) (JDK 19 will not work with React Native)

## Installation

### React Native

With `npm`:

```
npm install --save @coinbase/waas-sdk-react-native
```

With `yarn`:

```
yarn add @coinbase/waas-sdk-react-native
```

### Android

In your Android application's `settings.gradle` file, make sure to add the following:

```gradle

include ":android-native", ":android-native:go-internal-sdk", ":android-native:mpc-sdk" 

project(':android-native').projectDir = new File(rootProject.projectDir, '../node_modules/@coinbase/waas-sdk-react-native/android-native')
project(':android-native:mpc-sdk').projectDir = new File(rootProject.projectDir, '../node_modules/@coinbase/waas-sdk-react-native/android-native/mpc-sdk')
project(':android-native:go-internal-sdk').projectDir = new File(rootProject.projectDir, '../node_modules/@coinbase/waas-sdk-react-native/android-native/go-internal-sdk')
```

## Usage

See [index.tsx](./src/index.tsx) for the list of supported APIs.

## Example App

This repository provides an example app that demonstrates how the APIs should be used.

> NOTE: An example Cloud API Key json file is at `example/src/.coinbase_cloud_api_key.json`
> To run the example app, populate, or replace, this file with the Cloud API Key file provided to you
> by Coinbase.

### Running in Proxy-Mode (recommended)

To run the example app using `proxy-mode`:

1. Ensure the proxy server is correctly set up and active at the designated endpoint. The default endpoint is `localhost:8091`.
2. If your proxy server endpoint differs from the default, update the `proxyUrl` in the `config.json` file accordingly.
3. On app startup, choose `Proxy Mode` from the Mode Selection screen.

### Running in Direct-Mode (not recommended)

To run the example app using `direct-mode`:

1. Populate the `.coinbase_cloud_api_key.json` file with your personal API credentials.
2. On app startup, select `Direct Mode` from the Mode Selection screen.

### iOS
Ensure you have XCode open and run the following from the root directory of the repository:

```bash
yarn bootstrap # Install packages for the root and /example directories
yarn example start # Start the Metro server
yarn example ios --simulator "iPhone 14" # Build and start the app on iOS simulator
```

> *NOTE:* To build an app that depends on the WaaS SDK, you'll also need a compatible version of OpenSSL.
> You can build the OpenSSL framework by running the following on your Mac from the root of this repository:
> 
> `yarn ssl-ios`
> 
> You can alternatively depend on an open-compiled version of OpenSSL, like [OpenSSL-Universal](https://cocoapods.org/pods/OpenSSL-Universal), by adding the following to your app's Podfile:
> 
> `pod "OpenSSL-Universal"`

### Android
Ensure you have the following [Android environment variables](https://developer.android.com/studio/command-line/variables) set correctly:

-  `ANDROID_HOME`
-  `ANDROID_SDK_ROOT="${ANDROID_HOME}"`
-  `ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/<insert ndk version>"`
-  `ANDROID_NDK_ROOT="${ANDROID_NDK_HOME}"`

And then export the following to your `PATH`:

`export PATH="${ANDROID_HOME}/emulator:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/tools:${ANDROID_HOME}/tools/bin:${ANDROID_HOME}/platform-tools:${PATH}"`


Run the following from the root directory of the repository:

```bash
yarn install # Install packages for the root directory
emulator -avd Pixel_5_API_31 # Use any x86_64 emulator with min SDK version: 30.
yarn example start # Start the Metro server
yarn example android # Build and start the app on Android emulator
```

By following the above steps, you should be able to run the example app either in proxy-mode or direct-mode based on your preference and setup.

## Recommended Architecture

Broadly speaking, there are two possible approaches to using the WaaS SDK:

1. Use the WaaS backends directly for all calls.
2. Use the WaaS backends directly only for MPC operations; proxy all other calls through an intermediate server.

Of these two approaches, we recommend approach #2, as outlined in the following diagram:

![Recommended Set-up](./assets/diagram.png)

The motivation for placing a proxy server in between your application and the WaaS backends are as
follows:

1. Your proxy server can log API calls and collect metrics.
2. Your proxy server can filter results as it sees fit (e.g. policy enforcement).
3. Your proxy server can perform end user authentication.
4. Your proxy server can store the Coinbase API Key / Secret, rather than it being exposed to the client.
5. Your proxy server can throttle traffic.

In short, having a proxy server that you control in between your application and the WaaS backends will
afford you significantly more control than using the WaaS backends directly in most cases.

The methods from the WaaS SDK which are _required_ to be used for participation in MPC are:
1. `initMPCSdk`
2. `bootstrapDevice`
3. `getRegistrationData`
4. `computeMPCOperation`

## Proxy-Mode vs. Direct-Mode

Users can switch between two distinct operating modes: `proxy-mode` and `direct-mode`.

### Proxy-Mode (recommended)

**Proxy-mode** allows the application to connect to the Coinbase WaaS API through a proxy server. The primary features of this mode include:

- Initiate the SDK without needing the Coinbase Cloud API key details in the app itself. Communication will be authenticated during Proxy-Server <> WaaS API.
- The SDK, by default, points to a proxy server endpoint at `localhost:8091`. Update this `proxyUrl` in the `config.json` file.
- Cloud credentials are stored in the proxy server, eliminating the need to have them on the application side.

### Direct-Mode (not recommended)

**Direct-mode** enables the app to connect directly to the Coinbase WaaS API, bypassing the need for a proxy server. Key aspects of this mode are:

- The app communicates directly with the Coinbase WaaS API, with no involvement of a proxy server.
- Users must provide the API Key and private key for communication, retrieved from the `.coinbase_cloud_api_key.json` file.

# Native Waas SDK

We expose a Java 8+, `java.util.concurrent.Future`-based SDK for use with Java/Kotlin. An example
app is included in `android-native-example/` for more information.

## Requirements

- Java 8+
- Gradle 7.*
  - If using central gradle repositories, you may need to update your `settings.gradle` to not fail on project repos.
    - i.e (`repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)`)

## Installation
To begin, place the `android-native` directory relative to your project.

In your `settings.gradle`, include the following:

```
include ':android-native', ':android-native:mpc-sdk', ':android-native:go-internal-sdk'
project(':android-native').projectDir = new File(rootProject.projectDir, '../android-native')
project(':android-native:mpc-sdk').projectDir = new File(rootProject.projectDir, '../android-native/mpc-sdk')
project(':android-native:go-internal-sdk').projectDir = new File(rootProject.projectDir, '../android-native/go-internal-sdk')
```

Remember to specify the correct relative-location of `android-native`.

In your `build.gradle`, you should now take dependencies on

```
implementation project(":android-native")
implementation project(':android-native:mpc-sdk')
implementation project(':android-native:go-internal-sdk')
```

## Demo App
A demo app of the native SDK is included in `android-native/`. Opening this directory with Android Studio should be 
sufficient to build and run the app.

## Considerations

- The SDK should import cleanly into Kotlin as-is -- the sample app includes a demonstration of utilizing Waas's Futures
with Kotlin task-closures. Please reach out with any questions.