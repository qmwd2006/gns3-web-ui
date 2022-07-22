import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import{ Controller } from '../models/controller';

@Injectable()
export class NotificationService {
  notificationsPath(controller:Controller ): string {
    let protocol:string = "ws"
	  if (controller.protocol === "https:") {
		  protocol = "wss"
	  }

    return `${protocol}://${controller.host}:${controller.port}/${environment.current_version}/notifications/ws?token=${controller.authToken}`;
  }

  
  projectNotificationsPath(controller:Controller , project_id: string): string {
    let protocol:string = "ws"
	  if (controller.protocol === "https:") {
		  protocol = "wss"
	  }

    return `${protocol}://${controller.host}:${controller.port}/${environment.current_version}/projects/${project_id}/notifications/ws?token=${controller.authToken}`;
  }
}
