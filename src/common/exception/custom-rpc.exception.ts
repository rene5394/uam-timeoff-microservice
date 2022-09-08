import { HttpStatus } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

export class CustomRpcException extends RpcException {
  constructor(message: string, statusCode: HttpStatus, error: string) {
    super({
      statusCode: statusCode,
      message: [
        message
      ],
      error: error
    })
  }
}