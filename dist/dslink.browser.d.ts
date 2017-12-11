declare namespace __dslink {
	class Stream {
		// event emitter
		addListener(event: string, listener: Function): this;
		on(event: string, listener: Function): this;
		once(event: string, listener: Function): this;
		removeListener(event: string, listener: Function): this;
		removeAllListeners(event?: string): this;
		setMaxListeners(n: number): this;
		getMaxListeners(): number;
		listeners(event: string): Function[];
		emit(event: string, ...args: any[]): boolean;
		listenerCount(type: string): number;
      
		close(): void;
	}

	class SimpleActionNode extends SimpleNode {
		constructor(path: string, provider: any, cb?: any);
	}

	class UnserializableNode extends SimpleNode {
		constructor(path: string, provider?: NodeProvider);
	}

	function createNode(opt: any): any;
	function encodeNodeName(str: string): string;

	function updateLogLevel(name: string): any;
	function buildEnumType(values: string[]): string;
	function buildActionIO(types: any): any[];
	interface _getPrivateKey_options {
		storage?: DataStorage;
	}
	function getPrivateKey(_opt?: _getPrivateKey_options): Promise<any>;

	class Requester extends ConnectionHandler {
		lastRid: number;
		nodeCache: RemoteNodeCache;
		onError: Stream;
		openRequestCount: number;
		subscriptionCount: number;

		constructor(cache?: RemoteNodeCache);

		closeRequest(request: Request): any;
		sendRequest(m: any, updater: RequestUpdater): Request;
		getNodeValue(path: string): Promise<any>;
		onReconnected(): any;
		subscribe(path: string, callback: Function, qos?: number): ReqSubscribeListener;
		getNextRid(): number;
		remove(path: string): Promise<any>;
		list(path: string): Stream;
		onValueChange(path: string, qos?: number): Stream;
		onData(list: any[]): any;
		invoke(path: string, params?: any, maxPermission?: number, RequestConsumer?: any): Stream;
		isNodeCached(path: string): boolean;
		set(path: string, value: any, maxPermission?: number): Promise<any>;
		getRemoteNode(path: string): Promise<any>;
		unsubscribe(path: string, callback: Function): any;
		onDisconnected(): any;
		getSendingData(currentTime: number, waitingAckId: number): ProcessorResult;
	}

	class DefaultDefNodes {
		constructor();
	}

	class SubscribeController {
		request: SubscribeRequest;

		constructor();

		onReconnect(): any;
		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
	}

	class InvokeController {
		node: RemoteNode;
		mode: string;
		lastStatus: string;
		requester: Requester;

		constructor(node: RemoteNode, requester: Requester, params: any, maxPermission?: number, RequestConsumer?: any);
		static getNodeColumns(node: RemoteNode): TableColumn[];

		onReconnect(): any;
		onUpdate(streamStatus: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
	}

	class RemoveController {
		path: string;
		completer: any;
		requester: Requester;
		future: Promise<any>;

		constructor(requester: Requester, path: string);

		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onReconnect(): any;
		onDisconnect(): any;
	}

	class RequesterUpdate {
		streamStatus: string;

		constructor(streamStatus: string);
	}

	class ReqSubscribeListener {
		callback: any;
		requester: Requester;
		path: string;
		isPaused: boolean;

		constructor(requester: Requester, path: string, ValueUpdateCallback: any);

		onError(handleError: Function): any;
		onDone(handleDone: Function): any;
		cancel(): Promise<any>;
		onData(handleData: Function): any;
		pause(resumeSignal?: Promise<any>): any;
		resume(): any;
		asFuture(futureValue?: any): Promise<any>;
	}

	interface _RemoteNode_save_options {
		includeValue?: boolean;
	}

	class RemoteNode extends Node {
		name: string;
		listed: boolean;
		remotePath: string;
		hasValueUpdate: boolean;
		lastValueUpdate: ValueUpdate;
		subscribeController: ReqSubscribeController;

		constructor(remotePath: string);

		save(_opt?: _RemoteNode_save_options): any;
		createListController(requester: Requester): ListController;
		isUpdated(): boolean;
		isSelfUpdated(): boolean;
		updateRemoteChildData(m: any, cache: RemoteNodeCache): any;
		resetNodeCache(): any;
	}

	class RemoteNodeCache {
		cachedNodePaths: string[];

		constructor();

		getDefNode(path: string, defName: string): Node;
		clearCachedNode(path: string): any;
		isNodeCached(path: string): boolean;
		updateRemoteChildNode(parent: RemoteNode, name: string, m: any): RemoteNode;
		clear(): any;
		getRemoteNode(path: string): RemoteNode;
	}

	class RequestUpdater {
	}

	class ListDefListener {
		requester: Requester;
		ready: boolean;
		node: RemoteNode;
		listener: any;

		constructor(node: RemoteNode, requester: Requester, callback: Function);

		cancel(): any;
	}

	interface _RequesterInvokeUpdate_options {
		error?: DSError;
		meta?: any;
	}

	class RequesterInvokeUpdate extends RequesterUpdate {
		columns: TableColumn[];
		updates: any[];
		meta: any;
		rawColumns: any[];
		error: DSError;
		rows: any[][];

		constructor(updates: any[], rawColumns: any[], columns: TableColumn[], streamStatus: string, _opt?: _RequesterInvokeUpdate_options);
	}

	class RemoteDefNode extends RemoteNode {
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		constructor(path: string);

		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		getSimpleMap(): any;
		forEachAttribute(callback: Function): any;
		removeChild(input: any): string;
		addChild(name: string, node: Node): any;
		getChild(name: string): Node;
		get(name: string): any;
		getConfig(name: string): any;
	}

	class SetController {
		requester: Requester;
		value: any;
		completer: any;
		path: string;
		future: Promise<any>;

		constructor(requester: Requester, path: string, value: any, maxPermission?: number);

		onReconnect(): any;
		onDisconnect(): any;
		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
	}

	class ListController {
		request: Request;
		changes: any;
		node: RemoteNode;
		disconnectTs: string;
		requester: Requester;
		waitToSend: boolean;
		stream: Stream;
		initialized: boolean;

		constructor(node: RemoteNode, requester: Requester);

		onProfileUpdated(): any;
		onReconnect(): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		onUpdate(streamStatus: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
		loadProfile(defName: string): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		onStartListen(): any;
	}

	class ReqSubscribeController {
		node: RemoteNode;
		sid: number;
		currentQos: number;
		callbacks: any;
		requester: Requester;

		constructor(node: RemoteNode, requester: Requester);

		unlisten(callback: Function): any;
		addValue(update: ValueUpdate): any;
		listen(callback: Function, qos: number): any;
		updateQos(): boolean;
	}

	class RequesterListUpdate extends RequesterUpdate {
		node: RemoteNode;
		changes: string[];

		constructor(node: RemoteNode, changes: string[], streamStatus: string);
	}

	class Request {
		updater: RequestUpdater;
		requester: Requester;
		streamStatus: string;
		data: any;
		rid: number;
		isClosed: boolean;

		constructor(requester: Requester, rid: number, updater: RequestUpdater, data: any);

		resend(): any;
		close(): any;
		addReqParams(m: any): any;
	}

	class SubscribeRequest extends Request {
		lastSid: number;
		toRemove: any;
		subscriptions: any;
		subscriptionIds: any;

		constructor(requester: Requester, rid: number);

		getNextSid(): number;
		prepareSending(): any;
		resend(): any;
		removeSubscription(controller: ReqSubscribeController): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		addSubscription(controller: ReqSubscribeController, level: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
	}

	class PermissionList {
		groupMatchs: any;
		defaultPermission: number;
		idMatchs: any;

		constructor();

		getPermission(responder: Responder): number;
		updatePermissions(data: any[]): any;
	}

	class ServerLinkManager {
	}

	class Permission {
		static parse(obj: any, defaultVal?: number): number;
		constructor();
	}

	class ConnectionChannel {
	}

	class ConnectionAckGroup {
		ackId: number;
		startTime: number;
		expectedAckTime: number;
		processors: ConnectionProcessor[];

		constructor(ackId: number, startTime: number, processors: ConnectionProcessor[]);

		ackAll(ackid: number, time: number): any;
	}

	class StreamStatus {
		constructor();
	}

	class ClientLink {
	}

	class Unspecified {
		constructor();
	}

	class TableColumn {
		defaultValue: any;
		type: string;
		name: string;

		constructor(name: string, type: string, defaultValue?: any);
		static parseColumns(list: any[]): TableColumn[];
		static serializeColumns(list: any[]): any[];

		getData(): any;
	}

	class TableMetadata {
		meta: any;

		constructor(meta: any);
	}

	class ProcessorResult {
		processors: ConnectionProcessor[];
		messages: any[];

		constructor(messages: any[], processors: ConnectionProcessor[]);
	}

	class ServerLink {
	}

	class TableColumns {
		columns: TableColumn[];

		constructor(columns: TableColumn[]);
	}

	interface _Table_options {
		meta?: any;
	}

	class Table {
		meta: any;
		columns: TableColumn[];
		rows: any[][];

		constructor(columns: TableColumn[], rows: any[][], _opt?: _Table_options);
	}

	class BaseLink {
	}

	class Node {
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		static getDisplayName(nameOrPath: string): string;
		constructor();

		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		getSimpleMap(): any;
		forEachAttribute(callback: Function): any;
		removeChild(input: any): string;
		addChild(name: string, node: Node): any;
		getChild(name: string): Node;
		get(name: string): any;
		getConfig(name: string): any;
	}

	class ConnectionProcessor {
	}

	interface _DSError_options {
		detail?: string;
		msg?: string;
		path?: string;
		phase?: string;
	}

	class DSError {
		detail: string;
		type: string;
		phase: string;
		path: string;
		msg: string;

		constructor(type: string, _opt?: _DSError_options);
		static fromMap(m: any): any;

		serialize(): any;
		getMessage(): string;
	}

	class ErrorPhase {
		constructor();
	}

	class ConnectionHandler {
	}

	class PassiveChannel {
		conn: Connection;
		onConnectController: any;
		onDisconnectController: any;
		connected: boolean;
		handler: ConnectionHandler;
		onReceiveController: any;
		isReady: boolean;
		onReceive: Stream;
		onDisconnected: Promise<any>;
		onConnected: Promise<any>;

		constructor(conn: Connection, connected?: boolean);

		updateConnect(): any;
		getSendingData(currentTime: number, waitingAckId: number): ProcessorResult;
		sendWhenReady(handler: ConnectionHandler): any;
	}

	class Connection {
	}

	interface _ValueUpdate_options {
		count?: number;
		max?: number;
		meta?: any;
		min?: number;
		status?: string;
		sum?: number;
		ts?: string;
	}

	class ValueUpdate {
		status: string;
		value: any;
		created: Date;
		min: number;
		ts: string;
		waitingAck: number;
		sum: number;
		count: number;
		max: number;
		storedData: any;
		latency: any;
		timestamp: Date;

		static merge(oldUpdate: ValueUpdate, newUpdate: ValueUpdate): any;
		constructor(value: any, _opt?: _ValueUpdate_options);
		static getTs(): string;

		equals(other: ValueUpdate): boolean;
		mergeAdd(newUpdate: ValueUpdate): any;
		toMap(): any;
		cloneForAckQueue(): ValueUpdate;
	}

	class Path {
		parentPath: string;
		valid: boolean;
		name: string;
		path: string;
		isRoot: boolean;
		isAbsolute: boolean;
		isAttribute: boolean;
		isConfig: boolean;
		parent: Path;
		isNode: boolean;

		static getValidConfigPath(path: any, basePath?: string): Path;
		static getValidPath(path: any, basePath?: string): Path;
		constructor(path: string);
		static escapeName(str: string): string;
		static getValidAttributePath(path: any, basePath?: string): Path;
		static getValidNodePath(path: any, basePath?: string): Path;

		mergeBasePath(base: string, force?: boolean): any;
		child(name: string): Path;
	}

	class Interval {
		duration: any;
		inMilliseconds: number;

		constructor(duration: any);
		static forHours(hours: number): any;
		static forMilliseconds(ms: number): any;
		static forMinutes(minutes: number): any;
		static forSeconds(seconds: number): any;
	}

	class DSLinkJSON {
		description: string;
		configs: any;
		name: string;
		engines: any;
		main: string;
		getDependencies: string[];
		version: string;
		json: any;

		static from(map: any): DSLinkJSON;
		constructor();

		verify(): any;
		save(): any;
	}

	class Scheduler {
		currentTimer: any;

		constructor();
		static runLater(action: Function): any;
		static repeat(times: number, action: Function): Promise<any>;
		static after(duration: any, action: Function): Promise<any>;
		static tick(times: number, interval: Interval, action: Function): Promise<any>;
		static cancelCurrentTimer(): any;
		static runAfter(duration: any, action: Function): any;
		static every(interval: any, action: Function): any;
		static safeEvery(interval: any, action: Function): any;
		static later(action: Function): Promise<any>;
	}

	class PrivateKey {
	}

	class WebResponderStorage extends ISubscriptionResponderStorage {
		prefix: string;
		responderPath: string;
		values: any;

		constructor(prefix?: string);

		load(): Promise<any>;
		destroyValue(path: string): any;
		destroy(): any;
		getOrCreateValue(path: string): ISubscriptionNodeStorage;
	}

	class WebNodeStorage extends ISubscriptionNodeStorage {
		storePath: string;

		constructor(path: string, prefix: string, storage: WebResponderStorage);

		removeValue(value: ValueUpdate): any;
		setValue(removes: ValueUpdate[], newValue: ValueUpdate): any;
		addValue(value: ValueUpdate): any;
		destroy(): any;
		clear(qos: number): any;
		valueRemoved(updates: ValueUpdate[]): any;
		load(): any;
		getLoadedValues(): ValueUpdate[];
	}

	class DataStorage {
	}

	class SynchronousDataStorage {
	}

	class LocalDataStorage extends DataStorage {
		constructor();

		removeSync(key: string): string;
		has(key: string): Promise<any>;
		getSync(key: string): string;
		remove(key: string): Promise<any>;
		storeSync(key: string, value: string): any;
		hasSync(key: string): boolean;
		get(key: string): Promise<any>;
		store(key: string, value: string): Promise<any>;
	}

	interface _WebSocketConnection_options {
		enableAck?: boolean;
		onConnect?: Function;
		useCodec?: any;
	}

	class WebSocketConnection extends Connection {
		pingTimer: any;
		clientLink: ClientLink;
		onConnect: Function;
		nextMsgId: number;
		socket: any;
		requesterChannel: ConnectionChannel;
		responderChannel: ConnectionChannel;
		onRequesterReady: Promise<any>;
		onDisconnected: Promise<any>;

		constructor(socket: any, clientLink: ClientLink, _opt?: _WebSocketConnection_options);

		addConnCommand(key: string, value: any): any;
		requireSend(): any;
		close(): any;
		onPingTimer(t: any): any;
	}

	interface _BrowserECDHLink_options {
		formats?: any[];
		isRequester?: boolean;
		isResponder?: boolean;
		nodeProvider?: NodeProvider;
		token?: string;
	}

	class BrowserECDHLink extends ClientLink {
		requester: Requester;
		responder: Responder;
		tokenHash: string;
		dsId: string;
		salts: string[];
		formats: any[];
		format: string;
		token: string;
		enableAck: boolean;
		privateKey: PrivateKey;
		nonce: any;
		onConnected: Promise<any>;
		onRequesterReady: Promise<any>;

		constructor(_conn: string, dsIdPrefix: string, privateKey: PrivateKey, _opt?: _BrowserECDHLink_options);

		connect(): any;
		close(): any;
		initWebsocket(reconnect?: boolean): any;
		updateSalt(salt: string, saltId?: number): any;
	}

	interface _BrowserUserLink_options {
		enableAck?: boolean;
		format?: string;
		isRequester?: boolean;
		isResponder?: boolean;
		nodeProvider?: NodeProvider;
		wsUpdateUri?: string;
	}

	class BrowserUserLink extends ClientLink {
		format: string;
		enableAck: boolean;
		nonce: any;
		wsUpdateUri: string;
		requester: Requester;
		responder: Responder;
		privateKey: PrivateKey;
		onRequesterReady: Promise<any>;

		constructor(_opt?: _BrowserUserLink_options);

		updateSalt(salt: string, saltId?: number): any;
		initWebsocket(reconnect?: boolean): any;
		close(): any;
		connect(): any;
	}

	interface _BrowserUtils_createBinaryUrl_options {
		type?: string;
	}

	class BrowserUtils {
		static fetchBrokerUrlFromPath(path: string, otherwise: string): Promise<any>;
		static createBinaryUrl(input: Buffer, _opt?: _BrowserUtils_createBinaryUrl_options): string;
		constructor();
	}

	interface _LinkProvider_onValueChange_options {
		cacheLevel?: number;
	}
	interface _LinkProvider_options {
		dataStore?: DataStorage;
		defaultNodes?: any;
		isRequester?: boolean;
		isResponder?: boolean;
		loadNodes?: boolean;
		profiles?: any;
		provider?: NodeProvider;
		token?: string;
	}

	class LinkProvider {
		link: BrowserECDHLink;
		isResponder: boolean;
		profiles: any;
		privateKey: PrivateKey;
		token: string;
		brokerUrl: string;
		loadNodes: boolean;
		prefix: string;
		dataStore: DataStorage;
		defaultNodes: any;
		provider: NodeProvider;
		isRequester: boolean;
		onRequesterReady: Promise<any>;
		requester: Requester;

		constructor(brokerUrl: string, prefix: string, _opt?: _LinkProvider_options);

		getNode(path: string): LocalNode;
		initLinkWithPrivateKey(): Promise<any>;
		updateValue(path: string, value: any): any;
		resetSavedNodes(): Promise<any>;
		val(path: string, value?: any): any;
		addNode(path: string, m: any): LocalNode;
		syncValue(path: string): any;
		close(): any;
		onValueChange(path: string, _opt?: _LinkProvider_onValueChange_options): Stream;
		get(path: string): LocalNode;
		bitwiseNegate(): LocalNode;
		connect(): Promise<any>;
		save(): Promise<any>;
		removeNode(path: string): any;
		init(): Promise<any>;
	}

	class SimpleTableResult {
		rows: any[];
		columns: any[];

		constructor(rows?: any[], columns?: any[]);
	}

	interface _ConfigSetting_options {
		defaultValue?: any;
	}

	class ConfigSetting {
		defaultValue: any;
		name: string;
		type: string;

		constructor(name: string, type: string, _opt?: _ConfigSetting_options);
		static fromMap(name: string, m: any): any;

		removeConfig(node: LocalNodeImpl, responder: Responder): DSError;
		setConfig(value: any, node: LocalNodeImpl, responder: Responder): DSError;
	}

	class ListResponse extends Response {
		initialResponse: boolean;
		node: LocalNode;
		changes: any;

		constructor(responder: Responder, rid: number, node: LocalNode);

		prepareSending(): any;
		changed(key: string): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		getTraceData(change?: string): ResponseTrace;
		startSendingData(currentTime: number, waitingAckId: number): any;
	}

	class LocalNodeImpl {
	}

	class NodeProvider {
	}

	class AsyncTableResult {
		columns: any[];
		response: InvokeResponse;
		onClose: any;
		meta: any;
		status: string;
		rows: any[];

		constructor(columns?: any[]);

		close(): any;
		update(rows: any[], stat?: string, meta?: any): any;
		write(resp?: InvokeResponse): any;
	}

	class SubscribeResponse extends Response {
		subsriptionids: any;
		changed: any;
		subscriptions: any;

		constructor(responder: Responder, rid: number);

		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		remove(sid: number): any;
		subscriptionChanged(controller: RespSubscribeController): any;
		add(path: string, node: LocalNode, sid: number, qos: number): RespSubscribeController;
		addTraceCallback(ResponseTraceCallback: any): any;
		prepareSending(): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
	}

	class IValueStorageBucket {
	}

	class ISubscriptionResponderStorage {
	}

	interface _SysGetIconNode_updateValue_options {
		force?: boolean;
	}

	class SysGetIconNode extends SimpleNode {
		loaded: boolean;
		callbacks: any;
		path: string;
		listChangeController: any;
		listReady: boolean;
		exists: boolean;
		lastValueUpdate: ValueUpdate;
		valueReady: boolean;
		hasSubscriber: boolean;
		value: any;
		disconnected: string;
		listStream: Stream;
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		constructor(path: string, provider?: SimpleNodeProvider);

		onInvoke(params: any): any;
		serialize(withChildren: boolean): any;
		removeConfig(name: string, responder: Responder, response: Response): Response;
		removeAttribute(name: string, responder: Responder, response: Response): Response;
		updateList(name: string): any;
		getDisconnectedListResponse(): any[];
		overrideListChangeController(controller: any): any;
		getSetPermission(): number;
		updateValue(update: any, _opt?: _SysGetIconNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		onStartListListen(): any;
		onAllListCancel(): any;
		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		getSimpleMap(): any;
		forEachAttribute(callback: Function): any;
		getChild(name: string): Node;
		getConfig(name: string): any;
	}

	interface _Responder_closeResponse_options {
		error?: DSError;
		response?: Response;
	}
	interface _Responder_updateResponse_options {
		columns?: any[];
		handleMap?: Function;
		meta?: any;
		streamStatus?: string;
	}

	class Responder extends ConnectionHandler {
		maxCacheLength: number;
		disabled: boolean;
		storage: ISubscriptionResponderStorage;
		maxPermission: number;
		groups: string[];
		nodeProvider: NodeProvider;
		reqId: string;
		openResponseCount: number;
		subscriptionCount: number;

		constructor(nodeProvider: NodeProvider, reqId?: string);

		unsubscribe(m: any): any;
		list(m: any): any;
		removeTraceCallback(ResponseTraceCallback: any): any;
		closeResponse(rid: number, _opt?: _Responder_closeResponse_options): any;
		updateGroups(vals: string[], ignoreId?: boolean): any;
		onReconnected(): any;
		updateInvoke(m: any): any;
		addTraceCallback(ResponseTraceCallback: any): any;
		remove(m: any): any;
		close(m: any): any;
		traceResponseRemoved(response: Response): any;
		addResponse(response: Response): Response;
		subscribe(m: any): any;
		set(m: any): any;
		onData(list: any[]): any;
		initStorage(s: ISubscriptionResponderStorage, nodes: ISubscriptionNodeStorage[]): any;
		onDisconnected(): any;
		invoke(m: any): any;
		updateResponse(response: Response, updates: any[], _opt?: _Responder_updateResponse_options): any;
	}

	class DummyPermissionManager {
		constructor();

		getPermission(path: string, resp: Responder): number;
	}

	interface _InvokeResponse_updateStream_options {
		autoSendColumns?: boolean;
		columns?: any[];
		meta?: any;
		streamStatus?: string;
	}

	class InvokeResponse extends Response {
		onSendUpdate: any;
		parentNode: LocalNode;
		name: string;
		node: LocalNode;
		onReqParams: any;
		onClose: any;
		pendingData: any[];

		constructor(responder: Responder, rid: number, parentNode: LocalNode, node: LocalNode, name: string);

		getTraceData(change?: string): ResponseTrace;
		updateReqParams(m: any): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		close(err?: DSError): any;
		updateStream(updates: any[], _opt?: _InvokeResponse_updateStream_options): any;
	}

	interface _SimpleNodeProvider_removeNode_options {
		recurse?: boolean;
	}
	interface _SimpleNodeProvider_toString_options {
		showInstances?: boolean;
	}
	interface _SimpleNodeProvider_setNode_options {
		registerChildren?: boolean;
	}

	class SimpleNodeProvider extends NodeProviderImpl {
		nodes: any;
		root: SimpleNode;
		defs: SimpleHiddenNode;
		sys: SimpleHiddenNode;
		permissions: IPermissionManager;
		profileMap: any;

		constructor(m?: any, profiles?: any);

		removeNode(path: string, _opt?: _SimpleNodeProvider_removeNode_options): any;
		createNode(path: string, init?: boolean): SimpleNode;
		createResponder(dsId: string, sessionId: string): Responder;
		toString(_opt?: _SimpleNodeProvider_toString_options): string;
		addNode(path: string, m: any): SimpleNode;
		registerResolver(SimpleNodeFactory: any): any;
		setIconResolver(IconResolver: any): any;
		init(m?: any, profiles?: any): any;
		getNode(path: string): LocalNode;
		save(): any;
		updateValue(path: string, value: any): any;
		persist(now?: boolean): any;
		unregisterResolver(SimpleNodeFactory: any): any;
		hasNode(path: string): boolean;
		addProfile(name: string, NodeFactory: any): any;
		setNode(path: string, node: SimpleNode, _opt?: _SimpleNodeProvider_setNode_options): any;
		getOrCreateNode(path: string, addToTree?: boolean, init?: boolean): LocalNode;
		setPersistFunction(ExecutableFunction: any): any;
		bitwiseNegate(): LocalNode;
		get(path: string): LocalNode;
	}

	class Configs {
		configs: any;

		static getConfig(name: string, profile: Node): ConfigSetting;
		constructor();

		load(inputs: any): any;
	}

	class IValueStorage {
	}

	class MutableNodeProvider {
	}

	class RespSubscribeController {
		response: SubscribeResponse;
		node: LocalNode;
		waitingValues: any;
		lastValue: ValueUpdate;
		lastValues: ValueUpdate[];
		sid: number;
		cachingQueue: boolean;
		persist: boolean;
		permitted: boolean;
		caching: boolean;
		qosLevel: number;

		constructor(response: SubscribeResponse, node: LocalNode, sid: number, _permitted: boolean, qos: number);

		resetCache(values: ValueUpdate[]): any;
		destroy(): any;
		addValue(val: ValueUpdate): any;
		onAck(ackId: number): any;
		process(waitingAckId: number): any[];
	}

	class LocalNode {
	}

	class LiveTableRow {
		table: LiveTable;
		index: number;
		values: any[];

		constructor(table: LiveTable, values: any[]);

		delete(): any;
		setValue(idx: number, value: any): any;
	}

	class IPermissionManager {
	}

	interface _LiveTable_createRow_options {
		ready?: boolean;
	}

	class LiveTable {
		columns: TableColumn[];
		rows: LiveTableRow[];
		autoStartSend: boolean;
		response: InvokeResponse;

		static create(columns: TableColumn[], rows: LiveTableRow[]): any;
		constructor(columns?: TableColumn[]);

		resend(): any;
		reindex(): any;
		sendTo(resp: InvokeResponse): any;
		close(isFromRequester?: boolean): any;
		onRowUpdate(row: LiveTableRow): any;
		override(): any;
		clear(): any;
		doOnClose(f: Function): any;
		refresh(idx?: number): any;
		getCurrentState(from?: number): any[];
		createRow(values: any[], _opt?: _LiveTable_createRow_options): LiveTableRow;
	}

	interface _SimpleNode_attach_options {
		name?: string;
	}
	interface _SimpleNode_updateValue_options {
		force?: boolean;
	}

	class SimpleNode extends LocalNodeImpl {
		provider: SimpleNodeProvider;
		serializable: boolean;
		removed: boolean;
		type: string;
		parent: SimpleNode;
		displayName: string;
		isStubNode: boolean;
		name: string;
		writable: string;
		callbacks: any;
		path: string;
		listChangeController: any;
		listReady: boolean;
		exists: boolean;
		lastValueUpdate: ValueUpdate;
		valueReady: boolean;
		hasSubscriber: boolean;
		value: any;
		disconnected: string;
		listStream: Stream;
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		constructor(path: string, nodeprovider?: SimpleNodeProvider);
		static decryptString(str: string): string;
		static encryptString(str: string): string;
		static initEncryption(key: string): any;

		onCreated(): any;
		createChild(name: string, m?: any): SimpleNode;
		onChildRemoved(name: string, node: Node): any;
		onInvoke(params: any): any;
		load(m: any): any;
		attach(input: any, _opt?: _SimpleNode_attach_options): any;
		removeChild(input: any): string;
		onSubscribe(): any;
		onRemoving(): any;
		save(): any;
		onSetValue(val: any): boolean;
		set(name: string, value: any): any;
		setValue(value: any, responder: Responder, response: Response, maxPermission?: number): Response;
		unsubscribe(ValueUpdateCallback: any): any;
		hasConfig(name: string): boolean;
		onUnsubscribe(): any;
		onSetAttribute(name: string, value: string): boolean;
		get(name: string): any;
		hasAttribute(name: string): boolean;
		onChildAdded(name: string, node: Node): any;
		addChild(name: string, node: Node): any;
		setAttribute(name: string, value: any, responder: Responder, response: Response): Response;
		subscribe(ValueUpdateCallback: any, qos?: number): RespSubscribeListener;
		onSetConfig(name: string, value: string): boolean;
		invoke(params: any, responder: Responder, response: InvokeResponse, parentNode: Node, maxPermission?: number): InvokeResponse;
		setConfig(name: string, value: any, responder: Responder, response: Response): Response;
		onLoadChild(name: string, data: any, provider: SimpleNodeProvider): SimpleNode;
		remove(): any;
		getDisconnectedListResponse(): any[];
		overrideListChangeController(controller: any): any;
		getSetPermission(): number;
		updateValue(update: any, _opt?: _SimpleNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		onStartListListen(): any;
		onAllListCancel(): any;
		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		getSimpleMap(): any;
		forEachAttribute(callback: Function): any;
		getChild(name: string): Node;
		getConfig(name: string): any;
	}

	class RespSubscribeListener {
		node: LocalNode;
		callback: any;

		constructor(node: LocalNode, ValueUpdateCallback: any);

		cancel(): any;
	}

	interface _DefinitionNode_updateValue_options {
		force?: boolean;
	}

	class DefinitionNode extends LocalNodeImpl {
		provider: NodeProvider;
		callbacks: any;
		path: string;
		listChangeController: any;
		listReady: boolean;
		exists: boolean;
		lastValueUpdate: ValueUpdate;
		valueReady: boolean;
		hasSubscriber: boolean;
		value: any;
		disconnected: string;
		listStream: Stream;
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		constructor(path: string, provider: NodeProvider);

		invoke(params: any, responder: Responder, response: InvokeResponse, parentNode: Node, maxPermission?: number): InvokeResponse;
		setInvokeCallback(InvokeCallback: any): any;
		unsubscribe(ValueUpdateCallback: any): any;
		getDisconnectedListResponse(): any[];
		set(name: string, value: any): any;
		overrideListChangeController(controller: any): any;
		getSetPermission(): number;
		updateValue(update: any, _opt?: _DefinitionNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		onStartListListen(): any;
		subscribe(callback: Function, qos?: number): RespSubscribeListener;
		get(name: string): any;
		onAllListCancel(): any;
		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		getSimpleMap(): any;
		forEachAttribute(callback: Function): any;
		removeChild(input: any): string;
		addChild(name: string, node: Node): any;
		getChild(name: string): Node;
		getConfig(name: string): any;
	}

	interface _SimpleHiddenNode_updateValue_options {
		force?: boolean;
	}

	class SimpleHiddenNode extends SimpleNode {
		loaded: boolean;
		callbacks: any;
		path: string;
		listChangeController: any;
		listReady: boolean;
		exists: boolean;
		lastValueUpdate: ValueUpdate;
		valueReady: boolean;
		hasSubscriber: boolean;
		value: any;
		disconnected: string;
		listStream: Stream;
		configs: any;
		children: any;
		profile: Node;
		attributes: any;

		constructor(path: string, provider: SimpleNodeProvider);

		getSimpleMap(): any;
		serialize(withChildren: boolean): any;
		removeConfig(name: string, responder: Responder, response: Response): Response;
		removeAttribute(name: string, responder: Responder, response: Response): Response;
		updateList(name: string): any;
		getDisconnectedListResponse(): any[];
		overrideListChangeController(controller: any): any;
		getSetPermission(): number;
		updateValue(update: any, _opt?: _SimpleHiddenNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		onStartListListen(): any;
		onAllListCancel(): any;
		getAttribute(name: string): any;
		forEachConfig(callback: Function): any;
		forEachChild(callback: Function): any;
		getOverideAttributes(attr: string): any;
		forEachAttribute(callback: Function): any;
		getChild(name: string): Node;
		getConfig(name: string): any;
	}

	class ResponseTrace {
		change: string;
		type: string;
		path: string;
		action: string;
		rid: number;
		rowData: any[];

		constructor(path: string, type: string, rid: number, change?: string, action?: string);
	}

	class WaitForMe {
	}

	class Response {
		rid: number;
		responder: Responder;
		sentStreamStatus: string;

		constructor(responder: Responder, rid: number);

		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		prepareSending(): any;
		getTraceData(change?: string): ResponseTrace;
		close(err?: DSError): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
	}

	class NodeProviderImpl {
	}

	class ISubscriptionNodeStorage {
	}

	class SerializableNodeProvider {
	}

	class IStorageManager {
	}
}
      
declare module "dslink" {
	export = __dslink;
}
    

