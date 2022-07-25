import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { environment } from 'environments/environment';
import{ Controller } from '../models/controller';
import { CloudTemplate } from '../models/templates/cloud-template';
import { EthernetHubTemplate } from '../models/templates/ethernet-hub-template';
import { AppTestingModule } from '../testing/app-testing/app-testing.module';
import { BuiltInTemplatesService } from './built-in-templates.service';
import { HttpController } from './http-controller.service';
import { getTestController } from './testing';

describe('BuiltInTemplatesService', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let httpController: HttpController;
  let controller:Controller ;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AppTestingModule],
      providers: [HttpController, BuiltInTemplatesService],
    });

    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    httpController = TestBed.get(HttpController);
    controller = getTestController();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    expect(service).toBeTruthy();
  }));

  it('should update cloud template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    const cloudtemplate = {
      builtin: false,
      category: 'guest',
      compute_id: 'local',
      default_name_format: 'Cloud{0}',
      name: '',
      ports_mapping: [],
      remote_console_type: 'none',
      symbol: 'cloud',
      template_id: '1',
      template_type: 'cloud',
    } as CloudTemplate;

    service.saveTemplate(controller, cloudtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates/1`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(cloudtemplate);
  }));

  it('should update ethernet hub template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    let ethernethubtemplate: EthernetHubTemplate = {
      builtin: false,
      category: 'switch',
      compute_id: 'local',
      default_name_format: 'Hub{0}',
      name: '',
      ports_mapping: [],
      symbol: 'hub',
      template_id: '2',
      template_type: 'ethernet_hub',
    };

    service.saveTemplate(controller, ethernethubtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates/2`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(ethernethubtemplate);
  }));

  it('should update ethernet switch template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    let ethernetswitchtemplate: EthernetHubTemplate = {
      builtin: false,
      category: 'switch',
      compute_id: 'local',
      default_name_format: 'Hub{0}',
      name: '',
      ports_mapping: [],
      symbol: 'hub',
      template_id: '3',
      template_type: 'ethernet_hub',
    };

    service.saveTemplate(controller, ethernetswitchtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates/3`);
    expect(req.request.method).toEqual('PUT');
    expect(req.request.body).toEqual(ethernetswitchtemplate);
  }));

  it('should add cloud template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    const cloudtemplate = {
      builtin: false,
      category: 'guest',
      compute_id: 'local',
      default_name_format: 'Cloud{0}',
      name: '',
      ports_mapping: [],
      remote_console_type: 'none',
      symbol: 'cloud',
      template_id: '1',
      template_type: 'cloud',
    } as CloudTemplate;

    service.addTemplate(controller, cloudtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates`)
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(cloudtemplate);
  }));

  it('should add ethernet hub template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    let ethernethubtemplate: EthernetHubTemplate = {
      builtin: false,
      category: 'switch',
      compute_id: 'local',
      default_name_format: 'Hub{0}',
      name: '',
      ports_mapping: [],
      symbol: 'hub',
      template_id: '2',
      template_type: 'ethernet_hub',
    };

    service.addTemplate(controller, ethernethubtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates`)
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(ethernethubtemplate);
  }));

  it('should add ethernet switch template', inject([BuiltInTemplatesService], (service: BuiltInTemplatesService) => {
    let ethernetswitchtemplate: EthernetHubTemplate = {
      builtin: false,
      category: 'switch',
      compute_id: 'local',
      default_name_format: 'Hub{0}',
      name: '',
      ports_mapping: [],
      symbol: 'hub',
      template_id: '3',
      template_type: 'ethernet_hub',
    };

    service.addTemplate(controller, ethernetswitchtemplate).subscribe();

    const req = httpTestingController.expectOne(`http://127.0.0.1:3080/${environment.current_version}/templates`)
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(ethernetswitchtemplate);
  }));
});
