import { Injectable } from '@angular/core';
import { Template } from '../models/template';
import { BehaviorSubject, Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Node } from '../cartography/models/node';
import { Server } from '../models/server';
import { Symbol } from '../models/symbol';
import { HttpServer } from './http-server.service';
import { environment } from 'environments/environment';

const CACHE_SIZE = 1;

@Injectable()
export class SymbolService {
  public symbols: BehaviorSubject<Symbol[]> = new BehaviorSubject<Symbol[]>([]);
  private cache: Observable<Symbol[]>;
  private maximumSymbolSize: number = 80;

  constructor(private httpServer: HttpServer) {}

  getMaximumSymbolSize() {
    return this.maximumSymbolSize;
  }

  get(symbol_id: string): Symbol {
    return this.symbols.getValue().find((symbol: Symbol) => symbol.symbol_id === symbol_id);
  }

  getDimensions(controller: Server, symbol_id: string): Observable<SymbolDimension> {
    const encoded_uri = encodeURI(symbol_id);
    return this.httpServer.get(controller, `/symbols/${encoded_uri}/dimensions`);
  }

  scaleDimensionsForNode(node: Node): SymbolDimension {
    let scale = node.width > node.height ? this.maximumSymbolSize / node.width : this.maximumSymbolSize / node.height;
    return {
      width: node.width * scale,
      height: node.height * scale,
    };
  }

  getByFilename(symbol_filename: string) {
    return this.symbols.getValue().find((symbol: Symbol) => symbol.filename === symbol_filename);
  }

  add(controller: Server, symbolName: string, symbol: string) {
    this.cache = null;
    return this.httpServer.post(controller, `/symbols/${symbolName}/raw`, symbol);
  }

  load(controller: Server): Observable<Symbol[]> {
    return this.httpServer.get<Symbol[]>(controller, '/symbols');
  }

  list(controller: Server) {
    if (!this.cache) {
      this.cache = this.load(controller).pipe(shareReplay(CACHE_SIZE));
    }

    return this.cache;
  }

  raw(controller: Server, symbol_id: string) {
    const encoded_uri = encodeURI(symbol_id);
    return this.httpServer.getText(controller, `/symbols/${encoded_uri}/raw`);
  }

  getSymbolFromTemplate(controller: Server, template: Template) {
    return `${controller.protocol}//${controller.host}:${controller.port}/${environment.current_version}/symbols/${template.symbol}/raw`;
  }
}

class SymbolDimension {
  width: number;
  height: number;
}
