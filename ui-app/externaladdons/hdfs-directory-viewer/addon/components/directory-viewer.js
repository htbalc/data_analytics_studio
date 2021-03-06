/*
 *
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms of the
 * Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party authorized
 * to distribute this code.  If you do not have a written agreement with Hortonworks or with an authorized and
 * properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3:
 * (A) HORTONWORKS PROVIDES THIS CODE TO YOU WITHOUT WARRANTIES OF ANY KIND;
 * (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH RESPECT TO THIS CODE, INCLUDING BUT NOT
 *   LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE;
 * (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY, OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING
 *   FROM OR RELATED TO THE CODE; AND
 * (D) WITH RESPECT TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY
 *   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 *   DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 *   OR LOSS OR CORRUPTION OF DATA.
 *
 */

import Ember from 'ember';
import layout from '../templates/components/directory-viewer';

export default Ember.Component.extend({
  layout,
  counter: 0,
  config: Ember.Object.create({}),
  classNames: ['directory-viewer'],
  startPath: '/',
  folderName:'',
  isDirectory: true,
  isFile: true,
  fileBrowserHeight: '850',
  fileBrowserWidth: '650',
  maxBreadCrumbsCount: 3,
  elipsisLength: 8,
  isFolderCreationSuccess: null,
  isFolderCreationFailure: null,
  isFolderCreationprogress:false,
  // homeDirectory: '/app-logs/cstm-hdfs/logs',
  fileSystem: Ember.A(),
  currentPath: Ember.computed.oneWay('startPath'),
  currentPathArray: [{'path':'/'}],
  breadCrumbs: {},
  isCreateFolder : false,
  folderAccessError: {},
  createFolderError: {},
  filteredFileSytemInfo: Ember.computed('fileSystem', 'isDirectory', 'isFile', function() {
    return this.get('fileSystem').filter( (record) => {
      if(record.traverse) {
         return true;
      }
      if(this.get('isDirectory') && this.get('isFile')) {
         return record.isDirectory || !record.isDirectory;
      }
      if(this.get('isDirectory')) {
         return record.isDirectory;
      }
      if(this.get('isFile')) {
         return !record.isDirectory;
      }
      return;
  });
  }),
  currentQueryParam: Ember.computed('currentPath', 'homeDirectory', function() {
    if(this.get('counter') === 1 && this.get('homeDirectory')){
      this.set('currentPath', this.get('homeDirectory'));
    }
    return Ember.$.param({path: this.get('currentPath')});
  }),
  createFolderQueryParam: Ember.computed('currentPath', 'homeDirectory', 'folderName', function() {
    return {path: this.get('currentPath')+"/"+this.get('folderName')};
  }),
  isDataLoading: true,
  startFetch: Ember.on('didInitAttrs', function() {
    if(this.get('width')) {
      this.set('fileBrowserWidth', this.get('width'));
    }
    if(this.get('height')) {
      this.set('fileBrowserHeight', this.get('height'));
    }
    this.fetchData();
  }),
  setFileBroswerHeightAndWidth: Ember.on('didInsertElement', function() {
    Ember.$('.top-header, #file-view-unix').css('width', this.get('fileBrowserWidth'));
  }),
  fetchData: function() {
    this.incrementProperty('counter');
    this.startFileSystemFetchProgress();
    this.set('folderAccessError', {});
    this.listPath(this.get('currentQueryParam')).then(
      (response) => {
        let list = this.filterDirectoriesIfRequired(response.files);
        this.stopFileSystemFetchProgress();
        this.modifyFileSystemData(list);
      }, (error) => {
        this.set('folderAccessError', error.responseJSON);
        this.sendAction('errorAction', error);
        this.set('errorMsg', 'Error while accessing.Please try again.');
        this.stopFileSystemFetchProgress();
      }
    );
  },

  /**
   * Makes a XHR call and returns a promise.
   */
  listPath: function(params) {
    let config = this.get('config');
    let listUrl = config.listDirectoryUrl(params);
    let headers = config.getHeaders();
    return Ember.$.ajax(listUrl, {
      headers: headers
    });
  },
  createFolder() {
    let deferred = Ember.RSVP.defer();
    let config = this.get('config');
    let listUrl = config.createDirectoryUrl();
    let headers = config.getHeaders();
    headers = this.setHeadersForMkdir(headers);
    Ember.$.ajax(listUrl, {
      headers: headers,
      method:'PUT',
      data:JSON.stringify(this.get('createFolderQueryParam'))
    }).done(function(data){
        deferred.resolve(data);
    }).fail(function(data){
        deferred.reject(data);
    });
    return deferred.promise;
  },
  setHeadersForMkdir(headers) {
    headers['Accept'] = 'application/json';
    headers.dataType = 'json';
    headers['Content-Type'] = 'application/json; charset=UTF-8';
    return headers;
  },
  filterDirectoriesIfRequired: function(files) {
    let showOnlyDirectories = this.get('config.showOnlyDirectories');
    return files.filter((entry) => {
      return (!(showOnlyDirectories) || entry.isDirectory);
    });
  },

  modifyFileSystemData: function(response) {
    let paths = response.map((entry) => {
      let isDirectory = entry.isDirectory;
      let icon = isDirectory ? this.get('config.folderIcon') : this.get('config.fileIcon');
      let data = {
        path: entry.path,
        pathSegment: this.getNameForPath(entry.path),
        isDirectory: isDirectory,
        icon: icon,
        permission: entry.permission,
        text: this.getNameForPath(entry.path),
        selectedClass: ''
      };
      if(isDirectory) {
        data.nodes = Ember.A();
      }
      return data;
    });
    this.setCurrentPathAsList();
    paths = this.insertRootAsFirstPath(paths, this.get('currentPath'));
    this.setBreadCrumbsAndListMenu();
    this.set('fileSystem', paths);
    this.set('errorMsg', null);
    this.stopFileSystemFetchProgress();
  },
  insertRootAsFirstPath(paths, currentPath) {
    if(currentPath !== '/') {
       paths.unshift({traverse:true, path: this.get('currentPathArray')[this.get('currentPathArray').length-2 >=0 ?this.get('currentPathArray').length-2:this.get('currentPathArray').length-1].path});
    }
    return paths;
  },
  setBreadCrumbsAndListMenu() {
    let currentPathArray = this.get('currentPathArray');
    if(currentPathArray.length > this.get('maxBreadCrumbsCount')){
       this.set("breadCrumbs", {'dropDownMenu': currentPathArray.splice(0, currentPathArray.length - this.get('maxBreadCrumbsCount')), 'breadCrumbsMenu': currentPathArray.splice(0, currentPathArray.length)});
    } else {
       this.set("breadCrumbs", {'breadCrumbsMenu': currentPathArray});
    }
  },
  shortenName(name) {
    return name.length > this.get('elipsisLength') ? name.substring(0, this.get('elipsisLength'))+'...':name;
  },
  setCurrentPathAsList() {
    let currentPath = this.get('currentPath'), relPath = "", currentPathArr = currentPath.split('/');
    if(currentPath === "/") {
      currentPathArr = [""];
    }
    this.set('currentPathArray', []);
    currentPathArr.forEach(function(item, i) {
        if(i !== 1) {
         relPath = relPath + "/"+ item;
        } else if(i === 1){
         relPath = relPath + currentPathArr[i];
        }
        console.log(relPath+" is relPath");
        if(i === currentPathArr.length-1){
           if(0 === currentPathArr.length-1) {
             this.get('currentPathArray').push({'path':relPath, 'fullFileName' : item, 'name':item?this.shortenName(item):'root', isCurrentFolder: true, isRoot:true});
           } else{
             this.get('currentPathArray').push({'path':relPath, 'fullFileName' : item, 'name':item?this.shortenName(item):'root', isCurrentFolder: true});
           }
        } else if(i === 0){
           this.get('currentPathArray').push({'path':relPath, 'fullFileName' : item, 'name':item?this.shortenName(item):'root', isRoot:true});
        } else {
           this.get('currentPathArray').push({'path':relPath ,'fullFileName' : item,  'name':item?this.shortenName(item):'root'});
        }
    }.bind(this));
  },
  getNameForPath: function(path) {
    return path.substring(path.lastIndexOf("/") + 1);
  },
  stopFolderCreationProgress() {
    this.set('isFolderCreationprogress', false);
  },
  startFolderCreationProgress() {
    this.set('isFolderCreationprogress', true);
  },
  stopFileSystemFetchProgress() {
    this.set('isDataLoading', false);
  },
  startFileSystemFetchProgress() {
    this.set('isDataLoading', true);
  },
  resetFolderCreationMenuValidation() {
    this.set('isFolderCreationSuccess', false);
    this.set('isFolderCreationFailure', false);
  },
  folderCreationSuccess() {
    this.set('createFolderError', {});
    this.set('isFolderCreationSuccess', true);
    this.set('isFolderCreationFailure', false);
  },
  folderCreationFailure() {
    this.set('isFolderCreationSuccess', false);
    this.set('isFolderCreationFailure', true);
  },
  resetGoToPathMenuValidation() {
    this.set('isGoToFolderSuccess', false);
    this.set('isGoToFolderFailure', false);
  },
  hideGoToPathMenu() {
    this.set('isGoToFolder', false);
  },
  hideCreateFolderMenu() {
    this.set('isCreateFolder', false);
  },
  actions: {
    toggleCreateFolderMenu() {
      if(this.get('isGoToFolder')) {
        this.hideGoToPathMenu();
      }
      this.toggleProperty('isCreateFolder');
      this.resetFolderCreationMenuValidation();
    },
    toggleGoToFolderMenu() {
      if(this.get('isCreateFolder')) {
        this.hideCreateFolderMenu();
      }
      this.toggleProperty('isGoToFolder');
      this.resetGoToPathMenuValidation();
    },
    createFolder() {
      let currentPathTem = this.get('currentPath'), isDuplicate = false, duplicatePath = '';
      this.get('fileSystem').filter( (record) => {
        if(record.path === currentPathTem){
          isDuplicate = true;
          this.set('currentPath', record.path);
        }
      });
      if(Ember.isBlank(this.get('currentPath'))) {
        return true;
      }
      if(isDuplicate) {
        this.send('goToFolder');
        return true;
      }
      if(this.get('currentPath').indexOf('/') !== 0){
        this.set('errorMsg', 'Invalid path.');
        return;
      }
      this.startFolderCreationProgress();
      this.set('createFolderError', {});
      this.createFolder().then(function() {
         this.send('drillToPath', this.get('currentPath'));
         this.folderCreationSuccess();
         this.stopFolderCreationProgress();
      }.bind(this)).catch(function(e) {
         this.set('createFolderError', e.responseJSON);
         this.folderCreationFailure();
         this.stopFolderCreationProgress();
         console.error(e);
      }.bind(this));
    },
    goToFolder() {
      if(Ember.isBlank(this.get('currentPath'))) {
        return true;
      }
      this.send('drillToPath', this.get('currentPath'));
    },
    drillToPath(path, fileItem) {
       if(fileItem) {
        this.sendAction('pathSelectAction', fileItem);
       }
       if(path.indexOf('/') !== 0){
         this.set('errorMsg', 'Invalid path.');
         return;
       }
       this.set('currentPath', path);
       this.fetchData();
    },
    selectRow(index, fileItem) {
       this.sendAction('pathSelectAction', fileItem);
       this.get('fileSystem').forEach(function(item, i) {
          if(index === i && !item.traverse){
            Ember.set(item, "selectedClass", "row-selected");
          } else {
            Ember.set(item, "selectedClass", "");
          }
      });
    }
  }
});
