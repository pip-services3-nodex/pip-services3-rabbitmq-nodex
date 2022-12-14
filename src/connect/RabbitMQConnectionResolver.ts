/** @module connect */
import { IReferenceable } from 'pip-services3-commons-nodex';
import { IReferences } from 'pip-services3-commons-nodex';
import { IConfigurable } from 'pip-services3-commons-nodex';
import { ConfigParams } from 'pip-services3-commons-nodex';
import { ConfigException } from 'pip-services3-commons-nodex';
import { ConnectionResolver } from 'pip-services3-components-nodex';
import { CredentialResolver } from 'pip-services3-components-nodex';
import { ConnectionParams } from 'pip-services3-components-nodex';
import { CredentialParams } from 'pip-services3-components-nodex';

/**
 * Helper class that resolves RabbitMQ connection and credential parameters,
 * validates them and generates connection options.
 * 
 *  ### Configuration parameters ###
 * 
 * - connection(s):
 *   - discovery_key:               (optional) a key to retrieve the connection from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]]
 *   - host:                        host name or IP address
 *   - port:                        port number
 *   - uri:                         resource URI or connection string with all parameters in it
 * - credential(s):
 *   - store_key:                   (optional) a key to retrieve the credentials from [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/auth.icredentialstore.html ICredentialStore]]
 *   - username:                    user name
 *   - password:                    user password
 * 
 * ### References ###
 * 
 * - <code>\*:discovery:\*:\*:1.0</code>          (optional) [[https://pip-services3-nodex.github.io/pip-services3-components-nodex/interfaces/connect.idiscovery.html IDiscovery]] services to resolve connections
 * - <code>\*:credential-store:\*:\*:1.0</code>   (optional) Credential stores to resolve credentials
 */
export class RabbitMQConnectionResolver implements IReferenceable, IConfigurable {
    /** 
     * The connections resolver.
     */
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    /** 
     * The credentials resolver.
     */
    protected _credentialResolver: CredentialResolver = new CredentialResolver();

    /**
     * Configures component by passing configuration parameters.
     * 
     * @param config    configuration parameters to be set.
     */
    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }

    /**
	 * Sets references to dependent components.
	 * 
	 * @param references 	references to locate the component dependencies. 
     */
    public setReferences(references: IReferences): void {
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    private validateConnection(correlationId: string, connection: ConnectionParams): void {
        if (connection == null) {
            throw new ConfigException(
                correlationId,
                "NO_CONNECTION",
                "RabbitMQ connection is not set"
            );
        }

        let uri = connection.getUri();
        if (uri != null) {
            return null;
        }

        let protocol = connection.getAsStringWithDefault("protocol", "amqp");
        if (protocol == null) {
            throw new ConfigException(
                correlationId,
                "NO_PROTOCOL",
                "Connection protocol is not set"
            );
        }

        let host = connection.getHost();
        if (host == null) {
            throw new ConfigException(
                correlationId,
                "NO_HOST",
                "Connection host is not set"
            );
        }

        let port = connection.getAsInteger("port");
        if (port == 0) {
            throw new ConfigException(
                correlationId,
                "NO_PORT",
                "Connection port is not set"
            );
        }

        return;
    }

    private composeOptions(connection: ConnectionParams, credential: CredentialParams): ConfigParams {
        // Define additional parameters parameters
        let options = connection.override(credential);

        // Compose uri
        if (options.getAsString("uri") == null) {
            let credential = "";
            let uri = "";

            let username = options.getAsNullableString('username');
            let password = options.getAsNullableString('password');
            let protocol = connection.getAsStringWithDefault("protocol", 'amqp');
            let host = connection.getHost();
            let port = connection.getAsString("port");

            if (username != null && password != null) {
                credential = username + ":" + password;
            }
            
            if (credential == "") {
                uri = protocol + "://" + host + ":" + port;
            } else {
                uri = protocol + "://" + credential + "@" + host + ":" + port;
            }
            options.setAsObject("uri", uri);
        }

        return options;
    }

    /**
     * Resolves RabbitMQ connection options from connection and credential parameters.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @returns resolved RabbitMQ connection options.
     */
    public async resolve(correlationId: string): Promise<any> {
        let connection = await this._connectionResolver.resolve(correlationId);
        // Validate connections
        this.validateConnection(correlationId, connection);

        let credential = await this._credentialResolver.lookup(correlationId);
        // Credentials are not validated right now

        let options = this.composeOptions(connection, credential);
        return options;
    }

    /**
     * Composes RabbitMQ connection options from connection and credential parameters.
     * 
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @returns resolved RabbitMQ connection options.
     */
    public compose(correlationId: string, connection: ConnectionParams, credential: CredentialParams): ConfigParams {
        // Validate connections
        this.validateConnection(correlationId, connection);

        let options = this.composeOptions(connection, credential);
        return options;
    }
}
