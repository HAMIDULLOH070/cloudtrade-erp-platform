"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMonitoringModule = void 0;
const common_1 = require("@nestjs/common");
const cloud_monitoring_service_1 = require("./cloud-monitoring.service");
const cloud_monitoring_controller_1 = require("./cloud-monitoring.controller");
let CloudMonitoringModule = class CloudMonitoringModule {
};
exports.CloudMonitoringModule = CloudMonitoringModule;
exports.CloudMonitoringModule = CloudMonitoringModule = __decorate([
    (0, common_1.Module)({
        providers: [cloud_monitoring_service_1.CloudMonitoringService],
        controllers: [cloud_monitoring_controller_1.CloudMonitoringController],
        exports: [cloud_monitoring_service_1.CloudMonitoringService],
    })
], CloudMonitoringModule);
//# sourceMappingURL=cloud-monitoring.module.js.map