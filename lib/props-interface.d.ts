export interface PropsInterface {
    domainName?: string;
    environment?: string;
    onDisconnected: () => void;
    onConnected: () => void;
}
