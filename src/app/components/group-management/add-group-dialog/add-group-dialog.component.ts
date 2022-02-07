/*
* Software Name : GNS3 Web UI
* Version: 3
* SPDX-FileCopyrightText: Copyright (c) 2022 Orange Business Services
* SPDX-License-Identifier: GPL-3.0-or-later
*
* This software is distributed under the GPL-3.0 or any later version,
* the text of which is available at https://www.gnu.org/licenses/gpl-3.0.txt
* or see the "LICENSE" file for more details.
*
* Author: Sylvain MATHIEU, Elise LEBEAU
*/
import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {groupNameAsyncValidator} from "@components/group-management/add-group-dialog/groupNameAsyncValidator";
import {GroupNameValidator} from "@components/group-management/add-group-dialog/GroupNameValidator";
import {GroupService} from "../../../services/group.service";
import {Server} from "../../../models/server";
import {BehaviorSubject, forkJoin, timer} from "rxjs";
import {User} from "@models/users/user";
import {UserService} from "@services/user.service";
import {ToasterService} from "@services/toaster.service";
import {PageEvent} from "@angular/material/paginator";
import {Observable} from "rxjs/Rx";
import {Group} from "@models/groups/group";
import {map, startWith} from "rxjs/operators";

@Component({
  selector: 'app-add-group-dialog',
  templateUrl: './add-group-dialog.component.html',
  styleUrls: ['./add-group-dialog.component.scss'],
  providers: [GroupNameValidator]
})
export class AddGroupDialogComponent implements OnInit {

  groupNameForm: FormGroup;
  server: Server;

  users: User[];
  usersToAdd: Set<User> = new Set([]);
  filteredUsers: Observable<User[]>
  loading = false;
  autocompleteControl = new FormControl();



  constructor(private dialogRef: MatDialogRef<AddGroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { server: Server },
              private formBuilder: FormBuilder,
              private groupNameValidator: GroupNameValidator,
              private groupService: GroupService,
              private userService: UserService,
              private toasterService: ToasterService) {
  }

  ngOnInit(): void {
    this.server = this.data.server;
    this.groupNameForm = this.formBuilder.group({
      groupName: new FormControl(
        null,
        [Validators.required, this.groupNameValidator.get],
        [groupNameAsyncValidator(this.data.server, this.groupService)]
      ),
    });
    this.userService.list(this.server)
      .subscribe((users: User[]) => {
        this.users = users;
        this.filteredUsers = this.autocompleteControl.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value)),
        );
      })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onAddClick();
    }
  }

  get form() {
    return this.groupNameForm.controls;
  }

  onAddClick() {
    if (this.groupNameForm.invalid) {
      return;
    }
    const groupName = this.groupNameForm.controls['groupName'].value;
    const toAdd = Array.from(this.usersToAdd.values());


    this.groupService.addGroup(this.server, groupName)
      .subscribe((group) => {
        toAdd.forEach((user: User) => {
          this.groupService.addMemberToGroup(this.server, group, user)
            .subscribe(() => {
                this.toasterService.success(`user ${user.username} was added`);
              },
              (error) => {
                this.toasterService.error(`An error occur while trying to add user ${user.username} to group ${groupName}`);
              })
        })
        this.dialogRef.close(true);
      }, (error) => {
        this.toasterService.error(`An error occur while trying to create new group ${groupName}`);
        this.dialogRef.close(false);
      });
  }

  onNoClick() {
    this.dialogRef.close();
  }

  selectedUser(user: User) {
    this.usersToAdd.add(user);
  }

  delUser(user: User) {
    this.usersToAdd.delete(user);
  }

  private _filter(value: string): User[] {
    if (typeof value === 'string') {
      const filterValue = value.toLowerCase();

      return this.users.filter(option => option.username.toLowerCase().includes(filterValue)
        || (option.email?.toLowerCase().includes(filterValue)));
    }
  }

  displayFn(value): string {
    return value && value.username ? value.username : '';
  }

}
