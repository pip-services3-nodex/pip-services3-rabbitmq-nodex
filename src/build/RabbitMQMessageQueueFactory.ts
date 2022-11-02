/** @module build */
import { Descriptor } from 'pip-services3-commons-nodex';
import { IMessageQueue } from 'pip-services3-messaging-nodex';
import { MessageQueueFactory } from 'pip-services3-messaging-nodex';

import { RabbitMQMessageQueue } from '../queues/RabbitMQMessageQueue';

/**
 * Creates [[RabbitMQMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 * 
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[RabbitMQMessageQueue]]
 */
export class RabbitMQMessageQueueFactory extends MessageQueueFactory {
    private static readonly MemoryQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "rabbitmq", "*", "*");

    /**
	 * Create a new instance of the factory.
	 */
    public constructor() {
        super();
        this.register(RabbitMQMessageQueueFactory.MemoryQueueDescriptor, (locator: Descriptor) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null; 
            return this.createQueue(name);
        });
    }

    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
     public createQueue(name: string): IMessageQueue {
        let queue = new RabbitMQMessageQueue(name);

        if (this._config != null) {
            queue.configure(this._config);
        }
        if (this._references != null) {
            queue.setReferences(this._references);
        }

        return queue;        
    }    
}
