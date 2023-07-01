
import { writeFile, existsSync } from "fs";
import { ChatCompletionFunctionBase, ChatCompletionFunctionExecutionResult } from "../../base-function";
import exp from "constants";

export enum WriteCondition{
    NewOnly = 'NewOnly',
    NewOrOverwrite = 'NewOrOverwrite',
    Append = 'Append',
    AllwaysOverwrite = 'AllwaysOverwrite'
}

export interface WriteFileFunctionParameters {
    fileName: string;
    content: string;
    writeCondition: WriteCondition;
    addDescriptionOfProperty: (name: string) => string | undefined;
    addEnumForProperty: (name: string) => string[] | undefined;
}

export interface WriteFileFunctionResult {
    confirmation: string;
}

export class WriteToFileFunction extends ChatCompletionFunctionBase<WriteFileFunctionParameters, WriteFileFunctionResult>  {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected executeImplementation(parameters: WriteFileFunctionParameters): Promise<ChatCompletionFunctionExecutionResult<WriteFileFunctionResult>> {
        
            let flag = 'w';

            if (parameters.writeCondition === WriteCondition.NewOnly) {
                flag = 'wx';
            }
            else if (parameters.writeCondition === WriteCondition.NewOrOverwrite) {
                flag = 'w';
            }
            else if (parameters.writeCondition === WriteCondition.Append) {
                flag = 'a';
            }
            else if (parameters.writeCondition === WriteCondition.AllwaysOverwrite) {
                flag = 'w';
                const status = existsSync(parameters.fileName);
                if(!status){
                    return Promise.resolve({
                        role: 'function',
                        name: 'write_file',
                        content: {
                            confirmation: "Error: File does not exist"
                        }
                    });
                }
            }

            writeFile(parameters.fileName, parameters.content, { flag }, (err: any) => {
                if (err) {
                    console.error(err);
                    return;
                }
                //file exists
                return Promise.resolve({
                    role: 'function',
                    name: 'write_file',
                    content: {
                        confirmation: "Error:"+JSON.stringify(err)
                    }
                });
            });
        
        return Promise.resolve({
            role: 'function',
            name: 'write_file',
            content: {
                confirmation: "File saved"
            }
        });
    }
    public description = 'writes a content provided under "content" property to a file with a name provided under "fileName" property. The "writeCondition" property specifies under what conditions write operation will fail. Function returns "File saved" if operation was successful or message starting with "Error: " if operation failed';
    public name = 'write_file';

    public exampleInput: WriteFileFunctionParameters = {
        fileName: '/home/user/weather.txt',
        content: 'I am going to get the current weather',
        writeCondition: WriteCondition.NewOnly,
        addEnumForProperty: (property: string) => {
            switch (property) {
                case 'writeCondition':
                    return Object.values(WriteCondition);
                default:
                    return undefined;
            }
        },
        addDescriptionOfProperty: (property: string) => {
            switch (property) {
                case 'fileName':
                    return 'full path to the file with the name of the file';
                case 'content':
                    return 'full content of the file to be written on the disk'; 
                case 'writeCondition':
                    return 'specifies under what conditions write operation will fail: NewOnly - if file already exists operation will fail, NewOrOverwrite - if file exists it will be overriten if not new file will be created, Append - if file doesnt exist operation fill fail if it does new content will be added at the ond of a file, AllwaysOverwrite - if file exists it will be overriten if not function will return error'
                default:
                    return undefined;
            }
        }
    };


}

export const writeFileFunctionInstance = new WriteToFileFunction();