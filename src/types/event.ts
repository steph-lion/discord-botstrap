import { ClientEvents } from 'discord.js';

/**
 * Base class for all Discord events
 */
export abstract class BaseEvent<K extends keyof ClientEvents> {
  /**
   * The name of the event
   */
  public readonly name: K;

  /**
   * Whether the event should be triggered only once
   */
  public readonly once: boolean;

  /**
   * Creates a new event handler
   * @param name - The name of the event (from Discord.js ClientEvents)
   * @param once - Whether the event should only be triggered once
   */
  constructor(name: K, once = false) {
    this.name = name;
    this.once = once;
  }

  /**
   * Execute the event handler logic
   * @param args - Arguments provided by Discord.js for this event
   */
  public abstract execute(...args: ClientEvents[K]): Promise<void> | void;
}
