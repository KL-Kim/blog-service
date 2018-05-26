/**
 * gRPC client
 */
import grpc from 'grpc';

const NOTIFICATION_PROTO_PATH = __dirname + '/protos/notification.proto';

export const notificationProto = grpc.load(NOTIFICATION_PROTO_PATH).notification;
