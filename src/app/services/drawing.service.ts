import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { SvgToDrawingConverter } from '../cartography/helpers/svg-to-drawing-converter';
import { Drawing } from '../cartography/models/drawing';
import { Project } from '../models/project';
import { Server } from '../models/server';
import { HttpServer } from './http-server.service';

@Injectable()
export class DrawingService {
  constructor(private httpServer: HttpServer, private svgToDrawingConverter: SvgToDrawingConverter) {}

  add(controller: Server, project_id: string, x: number, y: number, svg: string) {
    return this.httpServer.post<Drawing>(controller, `/projects/${project_id}/drawings`, {
      svg: svg,
      x: Math.round(x),
      y: Math.round(y),
      z: 1,
    });
  }

  duplicate(controller: Server, project_id: string, drawing: Drawing) {
    return this.httpServer.post<Drawing>(controller, `/projects/${project_id}/drawings`, {
      svg: drawing.svg,
      rotation: drawing.rotation,
      x: drawing.x + 10,
      y: drawing.y + 10,
      z: drawing.z,
    });
  }

  updatePosition(controller: Server, project: Project, drawing: Drawing, x: number, y: number): Observable<Drawing> {
    let xPosition: number = Math.round(x);
    let yPosition: number = Math.round(y);

    if (project.snap_to_grid) {
      drawing.element = this.svgToDrawingConverter.convert(drawing.svg);

      xPosition =
        Math.round((xPosition + drawing.element.width / 2) / project.drawing_grid_size) * project.drawing_grid_size;
      yPosition =
        Math.round((yPosition + drawing.element.width / 2) / project.drawing_grid_size) * project.drawing_grid_size;

      xPosition = Math.round(xPosition - drawing.element.width / 2);
      yPosition = Math.round(yPosition - drawing.element.height / 2);
    }

    return this.httpServer.put<Drawing>(controller, `/projects/${drawing.project_id}/drawings/${drawing.drawing_id}`, {
      x: xPosition,
      y: yPosition,
    });
  }

  updateSizeAndPosition(controller: Server, drawing: Drawing, x: number, y: number, svg: string): Observable<Drawing> {
    return this.httpServer.put<Drawing>(controller, `/projects/${drawing.project_id}/drawings/${drawing.drawing_id}`, {
      svg: svg,
      x: Math.round(x),
      y: Math.round(y),
    });
  }

  updateText(controller: Server, drawing: Drawing, svg: string): Observable<Drawing> {
    return this.httpServer.put<Drawing>(controller, `/projects/${drawing.project_id}/drawings/${drawing.drawing_id}`, {
      svg: svg,
      x: Math.round(drawing.x),
      y: Math.round(drawing.y),
      z: drawing.z,
    });
  }

  update(controller: Server, drawing: Drawing): Observable<Drawing> {
    return this.httpServer.put<Drawing>(controller, `/projects/${drawing.project_id}/drawings/${drawing.drawing_id}`, {
      locked: drawing.locked,
      svg: drawing.svg,
      rotation: drawing.rotation,
      x: Math.round(drawing.x),
      y: Math.round(drawing.y),
      z: drawing.z,
    });
  }

  delete(controller: Server, drawing: Drawing) {
    return this.httpServer.delete<Drawing>(controller, `/projects/${drawing.project_id}/drawings/${drawing.drawing_id}`);
  }
}
