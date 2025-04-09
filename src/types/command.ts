import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/**
 * Interface for command objects
 */
export interface Command {
  /**
   * Command metadata used for registration
   */
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

  /**
   * Category for organizational purposes
   */
  category?: string;

  /**
   * Detailed description for help command
   */
  longDescription?: string;

  /**
   * Cooldown in seconds
   */
  cooldown?: number;

  /**
   * Flag indicating if the command is only for guild owners
   */
  ownerOnly?: boolean;

  /**
   * Flag indicating if the command is disabled
   */
  disabled?: boolean;

  /**
   * Command execution handler
   * @param interaction - The interaction object from Discord
   * @returns A promise that resolves when the command execution is complete
   */
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/**
 * Base class for all slash commands
 */
export abstract class BaseCommand implements Command {
  /**
   * Command metadata used for registration
   */
  public readonly data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder;

  /**
   * Category for organizational purposes
   */
  public readonly category?: string;

  /**
   * Detailed description for help command
   */
  public readonly longDescription?: string;

  /**
   * Cooldown in seconds
   */
  public readonly cooldown?: number;

  /**
   * Flag indicating if the command is only for guild owners
   */
  public readonly ownerOnly?: boolean;

  /**
   * Flag indicating if the command is disabled
   */
  public readonly disabled?: boolean;

  /**
   * Creates a new command
   * @param data - Command metadata used for registration
   * @param options - Optional command properties
   */
  constructor(
    data:
      | SlashCommandBuilder
      | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
      | SlashCommandSubcommandsOnlyBuilder,
    options?: {
      category?: string;
      longDescription?: string;
      cooldown?: number;
      ownerOnly?: boolean;
      disabled?: boolean;
    }
  ) {
    this.data = data;
    this.category = options?.category;
    this.longDescription = options?.longDescription;
    this.cooldown = options?.cooldown;
    this.ownerOnly = options?.ownerOnly;
    this.disabled = options?.disabled;
  }

  /**
   * Command execution handler
   * @param interaction - The interaction object from Discord
   * @returns A promise that resolves when the command execution is complete
   */
  public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
