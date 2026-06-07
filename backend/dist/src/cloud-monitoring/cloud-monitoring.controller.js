"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudMonitoringController = void 0;
const common_1 = require("@nestjs/common");
const cloud_monitoring_service_1 = require("./cloud-monitoring.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let CloudMonitoringController = class CloudMonitoringController {
    cloudService;
    constructor(cloudService) {
        this.cloudService = cloudService;
    }
    async getResources() {
        return this.cloudService.getResources();
    }
    async getMetrics(limit) {
        const lim = limit ? Number(limit) : 30;
        return this.cloudService.getMetrics(lim);
    }
    async getScalingLogs() {
        return this.cloudService.getScalingLogs();
    }
    async getSecurityLogs() {
        return this.cloudService.getSecurityLogs();
    }
    async getStatus() {
        return this.cloudService.getStatus();
    }
    async toggleSimulation(highLoad) {
        return this.cloudService.toggleSimulation(highLoad);
    }
};
exports.CloudMonitoringController = CloudMonitoringController;
__decorate([
    (0, common_1.Get)('resources'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "getResources", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "getMetrics", null);
__decorate([
    (0, common_1.Get)('logs/scaling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "getScalingLogs", null);
__decorate([
    (0, common_1.Get)('logs/security'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "getSecurityLogs", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('simulation'),
    __param(0, (0, common_1.Body)('highLoad')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], CloudMonitoringController.prototype, "toggleSimulation", null);
exports.CloudMonitoringController = CloudMonitoringController = __decorate([
    (0, common_1.Controller)('cloud'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cloud_monitoring_service_1.CloudMonitoringService])
], CloudMonitoringController);
//# sourceMappingURL=cloud-monitoring.controller.js.map