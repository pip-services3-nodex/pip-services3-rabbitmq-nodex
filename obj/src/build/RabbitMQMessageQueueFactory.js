"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQMessageQueueFactory = void 0;
/** @module build */
const pip_services3_commons_nodex_1 = require("pip-services3-commons-nodex");
const pip_services3_messaging_nodex_1 = require("pip-services3-messaging-nodex");
const RabbitMQMessageQueue_1 = require("../queues/RabbitMQMessageQueue");
/**
 * Creates [[RabbitMQMessageQueue]] components by their descriptors.
 * Name of created message queue is taken from its descriptor.
 *
 * @see [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/classes/build.factory.html Factory]]
 * @see [[RabbitMQMessageQueue]]
 */
class RabbitMQMessageQueueFactory extends pip_services3_messaging_nodex_1.MessageQueueFactory {
    /**
     * Create a new instance of the factory.
     */
    constructor() {
        super();
        this.register(RabbitMQMessageQueueFactory.MemoryQueueDescriptor, (locator) => {
            let name = (typeof locator.getName === "function") ? locator.getName() : null;
            return this.createQueue(name);
        });
    }
    /**
     * Creates a message queue component and assigns its name.
     * @param name a name of the created message queue.
     */
    createQueue(name) {
        let queue = new RabbitMQMessageQueue_1.RabbitMQMessageQueue(name);
        if (this._config != null) {
            queue.configure(this._config);
        }
        if (this._references != null) {
            queue.setReferences(this._references);
        }
        return queue;
    }
}
exports.RabbitMQMessageQueueFactory = RabbitMQMessageQueueFactory;
RabbitMQMessageQueueFactory.MemoryQueueDescriptor = new pip_services3_commons_nodex_1.Descriptor("pip-services", "message-queue", "rabbitmq", "*", "*");
//# sourceMappingURL=RabbitMQMessageQueueFactory.js.map