import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Server } from '../../../../models/server';
import { IouTemplate } from '../../../../models/templates/iou-template';
import { IouService } from '../../../../services/iou.service';
import { ServerService } from '../../../../services/server.service';
import { DeleteTemplateComponent } from '../../common/delete-template-component/delete-template.component';

@Component({
  selector: 'app-iou-templates',
  templateUrl: './iou-templates.component.html',
  styleUrls: ['./iou-templates.component.scss', '../../preferences.component.scss'],
})
export class IouTemplatesComponent implements OnInit {
  controller: Server;
  iouTemplates: IouTemplate[] = [];
  @ViewChild(DeleteTemplateComponent) deleteComponent: DeleteTemplateComponent;

  constructor(
    private route: ActivatedRoute,
    private serverService: ServerService,
    private iouService: IouService,
    private router: Router
  ) {}

  ngOnInit() {
    const controller_id = this.route.snapshot.paramMap.get('controller_id');
    this.serverService.get(parseInt(controller_id, 10)).then((controller: Server) => {
      this.controller = controller;
      this.getTemplates();
    });
  }

  getTemplates() {
    this.iouService.getTemplates(this.controller).subscribe((iouTemplates: IouTemplate[]) => {
      this.iouTemplates = iouTemplates.filter((elem) => elem.template_type === 'iou' && !elem.builtin);
    });
  }

  deleteTemplate(template: IouTemplate) {
    this.deleteComponent.deleteItem(template.name, template.template_id);
  }

  onDeleteEvent() {
    this.getTemplates();
  }

  copyTemplate(template: IouTemplate) {
    this.router.navigate(['/controller', this.controller.id, 'preferences', 'iou', 'templates', template.template_id, 'copy']);
  }
}
