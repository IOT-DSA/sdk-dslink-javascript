declare namespace __dslink {
	class Stream implements NodeJS.EventEmitter {
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

	function buildActionIO(types: any): any[];
	function buildEnumType(values: string[]): string;
	function updateLogLevel(name: string): any;
	interface _getPrivateKey_options {
		storage?: DataStorage;
	}
	function getPrivateKey(_opt?: _getPrivateKey_options): Promise<any>;

	interface _BrowserUtils_createBinaryUrl_options {
		type?: string;
	}

	class BrowserUtils {
		static fetchBrokerUrlFromPath(path: string, otherwise: string): Promise<any>;
		static createBinaryUrl(input: Buffer, _opt?: _BrowserUtils_createBinaryUrl_options): string;
		constructor();
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
	interface _LinkProvider_onValueChange_options {
		cacheLevel?: number;
	}

	class LinkProvider {
		link: BrowserECDHLink;
		defaultNodes: any;
		profiles: any;
		loadNodes: boolean;
		provider: NodeProvider;
		dataStore: DataStorage;
		privateKey: PrivateKey;
		brokerUrl: string;
		prefix: string;
		isRequester: boolean;
		isResponder: boolean;
		token: string;
		requester: Requester;
		onRequesterReady: Promise<any>;

		constructor(brokerUrl: string, prefix: string, _opt?: _LinkProvider_options);

		init(): Promise<any>;
		initLinkWithPrivateKey(): Promise<any>;
		resetSavedNodes(): Promise<any>;
		onValueChange(path: string, _opt?: _LinkProvider_onValueChange_options): Stream;
		save(): Promise<any>;
		syncValue(path: string): any;
		connect(): Promise<any>;
		close(): any;
		getNode(path: string): LocalNode;
		addNode(path: string, m: any): LocalNode;
		removeNode(path: string): any;
		updateValue(path: string, value: any): any;
		val(path: string, value?: any): any;
		get(path: string): LocalNode;
		bitwiseNegate(): LocalNode;
	}

	class DefaultDefNodes {
		constructor();
	}

	class RemoveController {
		completer: any;
		requester: Requester;
		path: string;
		future: Promise<any>;

		constructor(requester: Requester, path: string);

		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
		onReconnect(): any;
	}

	class SetController {
		completer: any;
		requester: Requester;
		path: string;
		value: any;
		future: Promise<any>;

		constructor(requester: Requester, path: string, value: any, maxPermission?: number);

		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
		onReconnect(): any;
	}

	class InvokeController {
		node: RemoteNode;
		requester: Requester;
		mode: string;
		lastStatus: string;

		static getNodeColumns(node: RemoteNode): TableColumn[];
		constructor(node: RemoteNode, requester: Requester, params: any, maxPermission?: number, RequestConsumer?: any);

		onUpdate(streamStatus: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		onDisconnect(): any;
		onReconnect(): any;
	}

	interface _RequesterInvokeUpdate_options {
		error?: DSError;
		meta?: any;
	}

	class RequesterInvokeUpdate extends RequesterUpdate {
		rawColumns: any[];
		columns: TableColumn[];
		updates: any[];
		error: DSError;
		meta: any;
		rows: any[][];

		constructor(updates: any[], rawColumns: any[], columns: TableColumn[], streamStatus: string, _opt?: _RequesterInvokeUpdate_options);
	}

	class ReqSubscribeController {
		node: RemoteNode;
		requester: Requester;
		callbacks: any;
		currentQos: number;
		sid: number;

		constructor(node: RemoteNode, requester: Requester);

		listen(callback: Function, qos: number): any;
		unlisten(callback: Function): any;
		updateQos(): boolean;
		addValue(update: ValueUpdate): any;
	}

	class SubscribeRequest extends Request {
		lastSid: number;
		subscriptions: any;
		subscriptionIds: any;
		toRemove: any;

		constructor(requester: Requester, rid: number);

		getNextSid(): number;
		resend(): any;
		addSubscription(controller: ReqSubscribeController, level: number): any;
		removeSubscription(controller: ReqSubscribeController): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		prepareSending(): any;
	}

	class SubscribeController {
		request: SubscribeRequest;

		constructor();

		onDisconnect(): any;
		onReconnect(): any;
		onUpdate(status: string, updates: any[], columns: any[], meta: any, error: DSError): any;
	}

	class ReqSubscribeListener {
		callback: any;
		requester: Requester;
		path: string;
		isPaused: boolean;

		constructor(requester: Requester, path: string, ValueUpdateCallback: any);

		cancel(): Promise<any>;
		asFuture(futureValue?: any): Promise<any>;
		onData(handleData: Function): any;
		onDone(handleDone: Function): any;
		onError(handleError: Function): any;
		pause(resumeSignal?: Promise<any>): any;
		resume(): any;
	}

	class ListController {
		node: RemoteNode;
		requester: Requester;
		request: Request;
		disconnectTs: string;
		changes: any;
		waitToSend: boolean;
		stream: Stream;
		initialized: boolean;

		constructor(node: RemoteNode, requester: Requester);

		onDisconnect(): any;
		onReconnect(): any;
		onUpdate(streamStatus: string, updates: any[], columns: any[], meta: any, error: DSError): any;
		loadProfile(defName: string): any;
		onProfileUpdated(): any;
		onStartListen(): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
	}

	class ListDefListener {
		node: RemoteNode;
		requester: Requester;
		listener: any;
		ready: boolean;

		constructor(node: RemoteNode, requester: Requester, callback: Function);

		cancel(): any;
	}

	class RequesterListUpdate extends RequesterUpdate {
		changes: string[];
		node: RemoteNode;

		constructor(node: RemoteNode, changes: string[], streamStatus: string);
	}

	class RemoteDefNode extends RemoteNode {
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		constructor(path: string);

		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		addChild(name: string, node: Node): any;
		removeChild(input: any): string;
		getChild(name: string): Node;
		get(name: string): any;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
		getSimpleMap(): any;
	}

	interface _RemoteNode_save_options {
		includeValue?: boolean;
	}

	class RemoteNode extends Node {
		remotePath: string;
		listed: boolean;
		name: string;
		subscribeController: ReqSubscribeController;
		hasValueUpdate: boolean;
		lastValueUpdate: ValueUpdate;

		constructor(remotePath: string);

		isUpdated(): boolean;
		isSelfUpdated(): boolean;
		createListController(requester: Requester): ListController;
		updateRemoteChildData(m: any, cache: RemoteNodeCache): any;
		resetNodeCache(): any;
		save(_opt?: _RemoteNode_save_options): any;
	}

	class RemoteNodeCache {
		cachedNodePaths: string[];

		constructor();

		getRemoteNode(path: string): RemoteNode;
		isNodeCached(path: string): boolean;
		clearCachedNode(path: string): any;
		clear(): any;
		getDefNode(path: string, defName: string): Node;
		updateRemoteChildNode(parent: RemoteNode, name: string, m: any): RemoteNode;
	}

	class Request {
		requester: Requester;
		rid: number;
		data: any;
		updater: RequestUpdater;
		streamStatus: string;
		isClosed: boolean;

		constructor(requester: Requester, rid: number, updater: RequestUpdater, data: any);

		resend(): any;
		addReqParams(m: any): any;
		close(): any;
	}

	class Requester extends ConnectionHandler {
		nodeCache: RemoteNodeCache;
		lastRid: number;
		subscriptionCount: number;
		openRequestCount: number;
		onError: Stream;

		constructor(cache?: RemoteNodeCache);

		onData(list: any[]): any;
		getNextRid(): number;
		getSendingData(currentTime: number, waitingAckId: number): ProcessorResult;
		sendRequest(m: any, updater: RequestUpdater): Request;
		isNodeCached(path: string): boolean;
		subscribe(path: string, callback: Function, qos?: number): ReqSubscribeListener;
		onValueChange(path: string, qos?: number): Stream;
		getNodeValue(path: string): Promise<any>;
		getRemoteNode(path: string): Promise<any>;
		unsubscribe(path: string, callback: Function): any;
		list(path: string): Stream;
		invoke(path: string, params?: any, maxPermission?: number, RequestConsumer?: any): Stream;
		set(path: string, value: any, maxPermission?: number): Promise<any>;
		remove(path: string): Promise<any>;
		closeRequest(request: Request): any;
		onDisconnected(): any;
		onReconnected(): any;
	}

	class RequesterUpdate {
		streamStatus: string;

		constructor(streamStatus: string);
	}

	class RequestUpdater {
	}

	class PermissionList {
		idMatchs: any;
		groupMatchs: any;
		defaultPermission: number;

		constructor();

		updatePermissions(data: any[]): any;
		getPermission(responder: Responder): number;
	}

	class Permission {
		static parse(obj: any, defaultVal?: number): number;
		constructor();
	}

	class ConnectionHandler {
	}

	class ConnectionProcessor {
	}

	class PassiveChannel {
		onReceiveController: any;
		conn: Connection;
		handler: ConnectionHandler;
		connected: boolean;
		onDisconnectController: any;
		onConnectController: any;
		onReceive: Stream;
		isReady: boolean;
		onDisconnected: Promise<any>;
		onConnected: Promise<any>;

		constructor(conn: Connection, connected?: boolean);

		sendWhenReady(handler: ConnectionHandler): any;
		getSendingData(currentTime: number, waitingAckId: number): ProcessorResult;
		updateConnect(): any;
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
		waitingAck: number;
		value: any;
		ts: string;
		status: string;
		count: number;
		sum: number;
		min: number;
		max: number;
		created: Date;
		storedData: any;
		timestamp: Date;
		latency: any;

		static getTs(): string;
		constructor(value: any, _opt?: _ValueUpdate_options);
		static merge(oldUpdate: ValueUpdate, newUpdate: ValueUpdate): any;

		mergeAdd(newUpdate: ValueUpdate): any;
		equals(other: ValueUpdate): boolean;
		toMap(): any;
		cloneForAckQueue(): ValueUpdate;
	}

	class TableMetadata {
		meta: any;

		constructor(meta: any);
	}

	class TableColumns {
		columns: TableColumn[];

		constructor(columns: TableColumn[]);
	}

	interface _Table_options {
		meta?: any;
	}

	class Table {
		columns: TableColumn[];
		rows: any[][];
		meta: any;

		constructor(columns: TableColumn[], rows: any[][], _opt?: _Table_options);
	}

	class TableColumn {
		type: string;
		name: string;
		defaultValue: any;

		constructor(name: string, type: string, defaultValue?: any);
		static serializeColumns(list: any[]): any[];
		static parseColumns(list: any[]): TableColumn[];

		getData(): any;
	}

	class Path {
		path: string;
		parentPath: string;
		name: string;
		valid: boolean;
		parent: Path;
		isAbsolute: boolean;
		isRoot: boolean;
		isConfig: boolean;
		isAttribute: boolean;
		isNode: boolean;

		static escapeName(str: string): string;
		static getValidPath(path: any, basePath?: string): Path;
		static getValidNodePath(path: any, basePath?: string): Path;
		static getValidAttributePath(path: any, basePath?: string): Path;
		static getValidConfigPath(path: any, basePath?: string): Path;
		constructor(path: string);

		child(name: string): Path;
		mergeBasePath(base: string, force?: boolean): any;
	}

	class Node {
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		static getDisplayName(nameOrPath: string): string;
		constructor();

		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		addChild(name: string, node: Node): any;
		removeChild(input: any): string;
		getChild(name: string): Node;
		get(name: string): any;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
		getSimpleMap(): any;
	}

	class Unspecified {
		constructor();
	}

	interface _DSError_options {
		detail?: string;
		msg?: string;
		path?: string;
		phase?: string;
	}

	class DSError {
		type: string;
		detail: string;
		msg: string;
		path: string;
		phase: string;

		constructor(type: string, _opt?: _DSError_options);
		static fromMap(m: any): any;

		getMessage(): string;
		serialize(): any;
	}

	class ErrorPhase {
		constructor();
	}

	class StreamStatus {
		constructor();
	}

	class ServerLinkManager {
	}

	class ClientLink {
	}

	class ServerLink {
	}

	class BaseLink {
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

	class ProcessorResult {
		messages: any[];
		processors: ConnectionProcessor[];

		constructor(messages: any[], processors: ConnectionProcessor[]);
	}

	class Connection {
	}

	class IValueStorage {
	}

	class IValueStorageBucket {
	}

	class ISubscriptionNodeStorage {
	}

	class ISubscriptionResponderStorage {
	}

	class IStorageManager {
	}

	class ResponseTrace {
		path: string;
		type: string;
		change: string;
		action: string;
		rid: number;
		rowData: any[];

		constructor(path: string, type: string, rid: number, change?: string, action?: string);
	}

	class DummyPermissionManager {
		constructor();

		getPermission(path: string, resp: Responder): number;
	}

	class IPermissionManager {
	}

	interface _SimpleHiddenNode_updateValue_options {
		force?: boolean;
	}

	class SimpleHiddenNode extends SimpleNode {
		loaded: boolean;
		path: string;
		callbacks: any;
		listChangeController: any;
		listStream: Stream;
		lastValueUpdate: ValueUpdate;
		value: any;
		valueReady: boolean;
		exists: boolean;
		listReady: boolean;
		disconnected: string;
		hasSubscriber: boolean;
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		constructor(path: string, provider: SimpleNodeProvider);

		getSimpleMap(): any;
		serialize(withChildren: boolean): any;
		updateList(name: string): any;
		removeAttribute(name: string, responder: Responder, response: Response): Response;
		removeConfig(name: string, responder: Responder, response: Response): Response;
		overrideListChangeController(controller: any): any;
		onStartListListen(): any;
		onAllListCancel(): any;
		updateValue(update: any, _opt?: _SimpleHiddenNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		getSetPermission(): number;
		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		getChild(name: string): Node;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
	}

	interface _SimpleNode_attach_options {
		name?: string;
	}
	interface _SimpleNode_updateValue_options {
		force?: boolean;
	}

	class SimpleNode extends LocalNodeImpl {
		provider: SimpleNodeProvider;
		removed: boolean;
		serializable: boolean;
		isStubNode: boolean;
		parent: SimpleNode;
		name: string;
		displayName: string;
		type: string;
		writable: string;
		path: string;
		callbacks: any;
		listChangeController: any;
		listStream: Stream;
		lastValueUpdate: ValueUpdate;
		value: any;
		valueReady: boolean;
		exists: boolean;
		listReady: boolean;
		disconnected: string;
		hasSubscriber: boolean;
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		constructor(path: string, nodeprovider?: SimpleNodeProvider);

		load(m: any): any;
		save(): any;
		invoke(params: any, responder: Responder, response: InvokeResponse, parentNode: Node, maxPermission?: number): InvokeResponse;
		onInvoke(params: any): any;
		onSetValue(val: any): boolean;
		onSetConfig(name: string, value: string): boolean;
		onSetAttribute(name: string, value: string): boolean;
		onSubscribe(): any;
		onUnsubscribe(): any;
		onCreated(): any;
		onRemoving(): any;
		onChildRemoved(name: string, node: Node): any;
		onChildAdded(name: string, node: Node): any;
		subscribe(ValueUpdateCallback: any, qos?: number): RespSubscribeListener;
		unsubscribe(ValueUpdateCallback: any): any;
		onLoadChild(name: string, data: any, provider: SimpleNodeProvider): SimpleNode;
		createChild(name: string, m?: any): SimpleNode;
		hasConfig(name: string): boolean;
		hasAttribute(name: string): boolean;
		remove(): any;
		attach(input: any, _opt?: _SimpleNode_attach_options): any;
		addChild(name: string, node: Node): any;
		removeChild(input: any): string;
		setAttribute(name: string, value: any, responder: Responder, response: Response): Response;
		setConfig(name: string, value: any, responder: Responder, response: Response): Response;
		setValue(value: any, responder: Responder, response: Response, maxPermission?: number): Response;
		get(name: string): any;
		set(name: string, value: any): any;
		overrideListChangeController(controller: any): any;
		onStartListListen(): any;
		onAllListCancel(): any;
		updateValue(update: any, _opt?: _SimpleNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		getSetPermission(): number;
		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		getChild(name: string): Node;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
		getSimpleMap(): any;
	}

	interface _SimpleNodeProvider_setNode_options {
		registerChildren?: boolean;
	}
	interface _SimpleNodeProvider_removeNode_options {
		recurse?: boolean;
	}
	interface _SimpleNodeProvider_toString_options {
		showInstances?: boolean;
	}

	class SimpleNodeProvider extends NodeProviderImpl {
		nodes: any;
		root: SimpleNode;
		defs: SimpleHiddenNode;
		sys: SimpleHiddenNode;
		permissions: IPermissionManager;
		profileMap: any;

		constructor(m?: any, profiles?: any);

		getNode(path: string): LocalNode;
		setIconResolver(IconResolver: any): any;
		getOrCreateNode(path: string, addToTree?: boolean, init?: boolean): LocalNode;
		hasNode(path: string): boolean;
		registerResolver(SimpleNodeFactory: any): any;
		unregisterResolver(SimpleNodeFactory: any): any;
		addProfile(name: string, NodeFactory: any): any;
		setPersistFunction(ExecutableFunction: any): any;
		persist(now?: boolean): any;
		createNode(path: string, init?: boolean): SimpleNode;
		init(m?: any, profiles?: any): any;
		save(): any;
		updateValue(path: string, value: any): any;
		setNode(path: string, node: SimpleNode, _opt?: _SimpleNodeProvider_setNode_options): any;
		addNode(path: string, m: any): SimpleNode;
		removeNode(path: string, _opt?: _SimpleNodeProvider_removeNode_options): any;
		createResponder(dsId: string, sessionId: string): Responder;
		toString(_opt?: _SimpleNodeProvider_toString_options): string;
		get(path: string): LocalNode;
		bitwiseNegate(): LocalNode;
	}

	interface _SysGetIconNode_updateValue_options {
		force?: boolean;
	}

	class SysGetIconNode extends SimpleNode {
		loaded: boolean;
		path: string;
		callbacks: any;
		listChangeController: any;
		listStream: Stream;
		lastValueUpdate: ValueUpdate;
		value: any;
		valueReady: boolean;
		exists: boolean;
		listReady: boolean;
		disconnected: string;
		hasSubscriber: boolean;
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		constructor(path: string, provider?: SimpleNodeProvider);

		onInvoke(params: any): any;
		serialize(withChildren: boolean): any;
		updateList(name: string): any;
		removeAttribute(name: string, responder: Responder, response: Response): Response;
		removeConfig(name: string, responder: Responder, response: Response): Response;
		overrideListChangeController(controller: any): any;
		onStartListListen(): any;
		onAllListCancel(): any;
		updateValue(update: any, _opt?: _SysGetIconNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		getSetPermission(): number;
		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		getChild(name: string): Node;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
		getSimpleMap(): any;
	}

	class MutableNodeProvider {
	}

	class SerializableNodeProvider {
	}

	class LiveTableRow {
		table: LiveTable;
		values: any[];
		index: number;

		constructor(table: LiveTable, values: any[]);

		setValue(idx: number, value: any): any;
		delete(): any;
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

		onRowUpdate(row: LiveTableRow): any;
		doOnClose(f: Function): any;
		createRow(values: any[], _opt?: _LiveTable_createRow_options): LiveTableRow;
		clear(): any;
		refresh(idx?: number): any;
		reindex(): any;
		override(): any;
		resend(): any;
		sendTo(resp: InvokeResponse): any;
		close(isFromRequester?: boolean): any;
		getCurrentState(from?: number): any[];
	}

	class AsyncTableResult {
		response: InvokeResponse;
		columns: any[];
		rows: any[];
		status: string;
		meta: any;
		onClose: any;

		constructor(columns?: any[]);

		update(rows: any[], stat?: string, meta?: any): any;
		write(resp?: InvokeResponse): any;
		close(): any;
	}

	class WaitForMe {
	}

	class SimpleTableResult {
		columns: any[];
		rows: any[];

		constructor(rows?: any[], columns?: any[]);
	}

	interface _DefinitionNode_updateValue_options {
		force?: boolean;
	}

	class DefinitionNode extends LocalNodeImpl {
		provider: NodeProvider;
		path: string;
		callbacks: any;
		listChangeController: any;
		listStream: Stream;
		lastValueUpdate: ValueUpdate;
		value: any;
		valueReady: boolean;
		exists: boolean;
		listReady: boolean;
		disconnected: string;
		hasSubscriber: boolean;
		profile: Node;
		attributes: any;
		configs: any;
		children: any;

		constructor(path: string, provider: NodeProvider);

		setInvokeCallback(InvokeCallback: any): any;
		invoke(params: any, responder: Responder, response: InvokeResponse, parentNode: Node, maxPermission?: number): InvokeResponse;
		overrideListChangeController(controller: any): any;
		onStartListListen(): any;
		onAllListCancel(): any;
		subscribe(callback: Function, qos?: number): RespSubscribeListener;
		unsubscribe(ValueUpdateCallback: any): any;
		updateValue(update: any, _opt?: _DefinitionNode_updateValue_options): any;
		clearValue(): any;
		getInvokePermission(): number;
		getSetPermission(): number;
		get(name: string): any;
		set(name: string, value: any): any;
		getOverideAttributes(attr: string): any;
		getAttribute(name: string): any;
		getConfig(name: string): any;
		addChild(name: string, node: Node): any;
		removeChild(input: any): string;
		getChild(name: string): Node;
		forEachChild(callback: Function): any;
		forEachConfig(callback: Function): any;
		forEachAttribute(callback: Function): any;
		getSimpleMap(): any;
	}

	class Configs {
		configs: any;

		static getConfig(name: string, profile: Node): ConfigSetting;
		constructor();

		load(inputs: any): any;
	}

	interface _ConfigSetting_options {
		defaultValue?: any;
	}

	class ConfigSetting {
		name: string;
		type: string;
		defaultValue: any;

		constructor(name: string, type: string, _opt?: _ConfigSetting_options);
		static fromMap(name: string, m: any): any;

		setConfig(value: any, node: LocalNodeImpl, responder: Responder): DSError;
		removeConfig(node: LocalNodeImpl, responder: Responder): DSError;
	}

	class LocalNodeImpl {
	}

	class NodeProviderImpl {
	}

	interface _InvokeResponse_updateStream_options {
		autoSendColumns?: boolean;
		columns?: any[];
		meta?: any;
		streamStatus?: string;
	}

	class InvokeResponse extends Response {
		parentNode: LocalNode;
		node: LocalNode;
		name: string;
		pendingData: any[];
		onReqParams: any;
		onClose: any;
		onSendUpdate: any;

		constructor(responder: Responder, rid: number, parentNode: LocalNode, node: LocalNode, name: string);

		updateStream(updates: any[], _opt?: _InvokeResponse_updateStream_options): any;
		updateReqParams(m: any): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		close(err?: DSError): any;
		getTraceData(change?: string): ResponseTrace;
	}

	class ListResponse extends Response {
		node: LocalNode;
		changes: any;
		initialResponse: boolean;

		constructor(responder: Responder, rid: number, node: LocalNode);

		changed(key: string): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		prepareSending(): any;
		getTraceData(change?: string): ResponseTrace;
	}

	class RespSubscribeController {
		node: LocalNode;
		response: SubscribeResponse;
		sid: number;
		lastValues: ValueUpdate[];
		waitingValues: any;
		lastValue: ValueUpdate;
		permitted: boolean;
		qosLevel: number;
		caching: boolean;
		persist: boolean;

		constructor(response: SubscribeResponse, node: LocalNode, sid: number, _permitted: boolean, qos: number);

		addValue(val: ValueUpdate): any;
		process(waitingAckId: number): any[];
		onAck(ackId: number): any;
		resetCache(values: ValueUpdate[]): any;
		destroy(): any;
	}

	class SubscribeResponse extends Response {
		subscriptions: any;
		subsriptionids: any;
		changed: any;

		constructor(responder: Responder, rid: number);

		add(path: string, node: LocalNode, sid: number, qos: number): RespSubscribeController;
		remove(sid: number): any;
		subscriptionChanged(controller: RespSubscribeController): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		prepareSending(): any;
		addTraceCallback(ResponseTraceCallback: any): any;
	}

	class RespSubscribeListener {
		callback: any;
		node: LocalNode;

		constructor(node: LocalNode, ValueUpdateCallback: any);

		cancel(): any;
	}

	class NodeProvider {
	}

	class LocalNode {
	}

	class Response {
		responder: Responder;
		rid: number;
		sentStreamStatus: string;

		constructor(responder: Responder, rid: number);

		close(err?: DSError): any;
		prepareSending(): any;
		startSendingData(currentTime: number, waitingAckId: number): any;
		ackReceived(receiveAckId: number, startTime: number, currentTime: number): any;
		getTraceData(change?: string): ResponseTrace;
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
		reqId: string;
		maxCacheLength: number;
		storage: ISubscriptionResponderStorage;
		groups: string[];
		nodeProvider: NodeProvider;
		disabled: boolean;
		openResponseCount: number;
		subscriptionCount: number;

		constructor(nodeProvider: NodeProvider, reqId?: string);

		initStorage(s: ISubscriptionResponderStorage, nodes: ISubscriptionNodeStorage[]): any;
		updateGroups(vals: string[], ignoreId?: boolean): any;
		addResponse(response: Response): Response;
		traceResponseRemoved(response: Response): any;
		onData(list: any[]): any;
		closeResponse(rid: number, _opt?: _Responder_closeResponse_options): any;
		updateResponse(response: Response, updates: any[], _opt?: _Responder_updateResponse_options): any;
		list(m: any): any;
		subscribe(m: any): any;
		unsubscribe(m: any): any;
		invoke(m: any): any;
		updateInvoke(m: any): any;
		set(m: any): any;
		remove(m: any): any;
		close(m: any): any;
		onDisconnected(): any;
		onReconnected(): any;
		addTraceCallback(ResponseTraceCallback: any): any;
		removeTraceCallback(ResponseTraceCallback: any): any;
	}

	class DSLinkJSON {
		name: string;
		version: string;
		description: string;
		main: string;
		engines: any;
		configs: any;
		getDependencies: string[];
		json: any;

		constructor();
		static from(map: any): DSLinkJSON;

		verify(): any;
		save(): any;
	}

	class Scheduler {
		currentTimer: any;

		static cancelCurrentTimer(): any;
		static every(interval: any, action: Function): any;
		static safeEvery(interval: any, action: Function): any;
		static repeat(times: number, action: Function): Promise<any>;
		static tick(times: number, interval: Interval, action: Function): Promise<any>;
		static runLater(action: Function): any;
		static later(action: Function): Promise<any>;
		static after(duration: any, action: Function): Promise<any>;
		static runAfter(duration: any, action: Function): any;
		constructor();
	}

	class Interval {
		duration: any;
		inMilliseconds: number;

		constructor(duration: any);
		static forMilliseconds(ms: number): any;
		static forSeconds(seconds: number): any;
		static forMinutes(minutes: number): any;
		static forHours(hours: number): any;
	}

	class PrivateKey {
	}

	interface _WebSocketConnection_options {
		enableAck?: boolean;
		onConnect?: Function;
		useCodec?: any;
	}

	class WebSocketConnection extends Connection {
		clientLink: ClientLink;
		socket: any;
		onConnect: Function;
		pingTimer: any;
		nextMsgId: number;
		responderChannel: ConnectionChannel;
		requesterChannel: ConnectionChannel;
		onRequesterReady: Promise<any>;
		onDisconnected: Promise<any>;

		constructor(socket: any, clientLink: ClientLink, _opt?: _WebSocketConnection_options);

		onPingTimer(t: any): any;
		requireSend(): any;
		addConnCommand(key: string, value: any): any;
		close(): any;
	}

	interface _BrowserECDHLink_options {
		formats?: any[];
		isRequester?: boolean;
		isResponder?: boolean;
		nodeProvider?: NodeProvider;
		token?: string;
	}

	class BrowserECDHLink extends ClientLink {
		dsId: string;
		token: string;
		requester: Requester;
		responder: Responder;
		privateKey: PrivateKey;
		enableAck: boolean;
		salts: string[];
		tokenHash: string;
		formats: any[];
		format: string;
		onConnected: Promise<any>;
		onRequesterReady: Promise<any>;
		nonce: any;

		constructor(_conn: string, dsIdPrefix: string, privateKey: PrivateKey, _opt?: _BrowserECDHLink_options);

		updateSalt(salt: string, saltId?: number): any;
		connect(): any;
		initWebsocket(reconnect?: boolean): any;
		close(): any;
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
		requester: Requester;
		responder: Responder;
		nonce: any;
		privateKey: PrivateKey;
		enableAck: boolean;
		wsUpdateUri: string;
		format: string;
		onRequesterReady: Promise<any>;

		constructor(_opt?: _BrowserUserLink_options);

		updateSalt(salt: string, saltId?: number): any;
		connect(): any;
		initWebsocket(reconnect?: boolean): any;
		close(): any;
	}

	class LocalDataStorage extends DataStorage {
		constructor();

		get(key: string): Promise<any>;
		has(key: string): Promise<any>;
		store(key: string, value: string): Promise<any>;
		remove(key: string): Promise<any>;
		removeSync(key: string): string;
		storeSync(key: string, value: string): any;
		hasSync(key: string): boolean;
		getSync(key: string): string;
	}

	class SynchronousDataStorage {
	}

	class DataStorage {
	}

	class WebNodeStorage extends ISubscriptionNodeStorage {
		storePath: string;

		constructor(path: string, prefix: string, storage: WebResponderStorage);

		addValue(value: ValueUpdate): any;
		setValue(removes: ValueUpdate[], newValue: ValueUpdate): any;
		removeValue(value: ValueUpdate): any;
		valueRemoved(updates: ValueUpdate[]): any;
		clear(qos: number): any;
		destroy(): any;
		load(): any;
		getLoadedValues(): ValueUpdate[];
	}

	class WebResponderStorage extends ISubscriptionResponderStorage {
		values: any;
		prefix: string;
		responderPath: string;

		constructor(prefix?: string);

		getOrCreateValue(path: string): ISubscriptionNodeStorage;
		load(): Promise<any>;
		destroyValue(path: string): any;
		destroy(): any;
	}
}
      
declare module "dslink" {
	export = __dslink;
}
    

