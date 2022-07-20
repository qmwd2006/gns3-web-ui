import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, from } from 'rxjs';
import { map } from 'rxjs//operators';
import { Observable } from 'rxjs/Rx';
import { Server, ServerProtocol } from '../../../models/server';
import { Version } from '../../../models/version';
import { ServerDatabase } from '../../../services/server.database';
import { ServerService } from '../../../services/server.service';
import { VersionService } from '../../../services/version.service';

@Component({
  selector: 'app-controller-discovery',
  templateUrl: './controller-discovery.component.html',
  styleUrls: ['./controller-discovery.component.scss'],
})
export class ControllerDiscoveryComponent implements OnInit {
  private defaultServers = [
    {
      host: '127.0.0.1',
      port: 3080,
    },
  ];

  discoveredServer: Server;

  constructor(
    private versionService: VersionService,
    private serverService: ServerService,
    private serverDatabase: ServerDatabase,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.serverService.isServiceInitialized) this.discoverFirstServer();
    this.serverService.serviceInitialized.subscribe(async (value: boolean) => {
      if (value) {
        this.discoverFirstServer();
      }
    });
  }

  async discoverFirstServer() {
    let discovered = await this.discoverServers();
    let local = await this.serverService.findAll();

    local.forEach((added) => {
      discovered = discovered.filter((controller) => {
        return !(controller.host == added.host && controller.port == added.port);
      });
    });

    if (discovered.length > 0) {
      this.discoveredServer = discovered.shift();
    }
  }

  async discoverServers() {
    let discoveredServers: Server[] = [];
    this.defaultServers.forEach(async (testServer) => {
      const controller = new Server();
      controller.host = testServer.host;
      controller.port = testServer.port;
      let version = await this.versionService
        .get(controller)
        .toPromise()
        .catch((error) => null);
      if (version) discoveredServers.push(controller);
    });
    return discoveredServers;
  }

  discoverFirstAvailableServer() {
    forkJoin([from(this.serverService.findAll()).pipe(map((s: Server[]) => s)), this.discovery()]).subscribe(
      ([local, discovered]) => {
        local.forEach((added) => {
          discovered = discovered.filter((controller) => {
            return !(controller.host == added.host && controller.port == added.port);
          });
        });
        if (discovered.length > 0) {
          this.discoveredServer = discovered.shift();
        }
      },
      (error) => {}
    );
  }

  discovery(): Observable<Server[]> {
    const queries: Observable<Server>[] = [];

    this.defaultServers.forEach((testServer) => {
      queries.push(
        this.isServerAvailable(testServer.host, testServer.port).catch((err) => {
          return Observable.of(null);
        })
      );
    });

    return new Observable<Server[]>((observer) => {
      forkJoin(queries).subscribe((discoveredServers) => {
        observer.next(discoveredServers.filter((s) => s != null));
        observer.complete();
      });
    });
  }

  isServerAvailable(ip: string, port: number): Observable<Server> {
    const controller = new Server();
    controller.host = ip;
    controller.port = port;
    return this.versionService.get(controller).flatMap((version: Version) => Observable.of(controller));
  }

  ignore(controller: Server) {
    this.discoveredServer = null;
  }

  accept(controller: Server) {
    if (controller.name == null) {
      controller.name = controller.host;
    }

    controller.location = 'remote';
    controller.protocol = location.protocol as ServerProtocol;

    this.serverService.create(controller).then((created: Server) => {
      this.serverDatabase.addServer(created);
      this.discoveredServer = null;
    });
  }
}
