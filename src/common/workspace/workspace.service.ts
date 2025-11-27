import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';

import MongoErrorCode from '../database/enums/mongo-error-code.enum';
import { ERROR_CODES } from '../error/constants/error-code';
import { AppRequestException } from '../error/exceptions/app-request.exception';
import { WorkspaceDoc } from './repository/entities/workspace.entity';
import { WorkspaceModel } from './repository/models/workspace.model';

@Injectable()
export class WorkspaceService {
  constructor(private readonly workspaceModel: WorkspaceModel) {}

  // TODO: GENERATE STRIPE CUSTOMER ID
  async createWorkspace({ name }: { name: string }): Promise<WorkspaceDoc> {
    try {
      return await this.workspaceModel.create({
        name,
        stripeCustomerId: Date.now().toString(),
      });
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async findById(workspaceId: string): Promise<WorkspaceDoc> {
    const workspace = await this.workspaceModel.findOneById(workspaceId);

    if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

    if (!workspace.ownerId) {
      throw new AppRequestException({
        ...ERROR_CODES.DATABASE_ERROR,
        message: 'Workspace is in an invalid state: missing owner',
      });
    }

    return workspace;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<WorkspaceDoc> {
    const workspace = await this.workspaceModel.findOne({
      stripeCustomerId,
    });
    if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

    return workspace;
  }

  async updateOne(
    filter: Partial<WorkspaceDoc>,
    update: Partial<WorkspaceDoc>,
  ): Promise<WorkspaceDoc> {
    try {
      const workspace = await this.workspaceModel.updateOne(filter, update);

      return workspace;
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async updateSubscription({
    workspaceId,
    stripeSubscriptionId,
  }: {
    workspaceId: string;
    stripeSubscriptionId: string;
  }) {
    return this.workspaceModel.updateOne(
      { _id: new Types.ObjectId(workspaceId) },
      {
        stripeSubscriptionId,
        activeSubscription: true,
      },
    );
  }

  async updateSubdomain({ workspaceId, subdomain }: { workspaceId: string; subdomain: string }) {
    try {
      return this.workspaceModel.updateOne(
        { _id: new Types.ObjectId(workspaceId) },
        {
          subdomain,
        },
      );
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async updateWorkspaceOwner({ workspaceId, ownerId }: { workspaceId: string; ownerId: string }) {
    try {
      return this.workspaceModel.updateOne(
        { _id: new Types.ObjectId(workspaceId) },
        {
          ownerId: new Types.ObjectId(ownerId),
        },
      );
    } catch (error) {
      if (error?.code === MongoErrorCode.DuplicateKey)
        throw new AppRequestException({ ...ERROR_CODES.DUPLICATE_KEY, errors: [error] });

      throw new AppRequestException({ ...ERROR_CODES.DATABASE_ERROR, errors: [error] });
    }
  }

  async getWorkSpaceBySubdomain(subdomain: string): Promise<WorkspaceDoc> {
    const workspace = await this.workspaceModel.findOne({ subdomain });

    if (!workspace) throw new AppRequestException(ERROR_CODES.WORKSPACE_NOT_FOUND);

    return workspace;
  }

  async validateSubDomainAvailability(subdomain: string): Promise<boolean> {
    const workspace = await this.workspaceModel.findOne({ subdomain });

    if (!workspace) return true;

    return false;
  }

  async validateWorkspaceIntegrity(): Promise<{ invalidWorkspaces: string[] }> {
    const workspacesWithoutOwner = await this.workspaceModel.findAll({
      ownerId: { $exists: false },
    });

    return {
      invalidWorkspaces: workspacesWithoutOwner.map((w) => w._id?.toString() || ''),
    };
  }

  async setDefaultProfileForWorkspace({
    workspaceId,
    profileId,
  }: {
    workspaceId: string;
    profileId: string;
  }): Promise<WorkspaceDoc> {
    const workspace = await this.workspaceModel.updateOne(
      { _id: new Types.ObjectId(workspaceId) },
      {
        defaultProfileId: new Types.ObjectId(profileId),
      },
    );

    return workspace;
  }

  async deleteById(id: string): Promise<WorkspaceDoc> {
    const workspace = await this.workspaceModel.softDeleteById(id);

    return workspace;
  }
}
